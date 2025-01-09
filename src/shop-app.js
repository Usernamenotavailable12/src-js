(function () {
  const GET_SHOP_ITEMS_QUERY = `
        query ShopItemConnection {
          shopItemConnection(
            shopItemCategoryId: "ycGrHNho6Y4cSh60pN3O",
            orderBy: [
              {
                field: order,
                direction: ASCENDING
              }
            ]
          ) {
            edges {
              node {
                price {
                  value
                }
                description
                id
                contentId
              }
            }
          }
        }
      `;

  const PURCHASE_ITEM_MUTATION = `
        mutation PurchaseShopItems($input: PurchaseShopItemsInput!) {
          purchaseShopItems(input: $input) {
            shopTransaction {
              userId
              shopItems {
                id
              }
            }
          }
        }
      `;

  function createShopItem(item) {
    const itemDiv = document.createElement("div");

    itemDiv.className = `shop-item ${item.contentId || "default-contentId"}`;
    itemDiv.setAttribute("data-id", item.id);

    const description = document.createElement("h3");
    description.className = "description";
    description.textContent = item.description || "No description available.";
    itemDiv.appendChild(description);

    const buyButton = document.createElement("button");
    buyButton.textContent = `${item.price.value} ❤️`;
    buyButton.setAttribute("onclick", `window.handleBuy('${item.id}')`);
    itemDiv.appendChild(buyButton);

    return itemDiv;
  }

  async function loadShopItems() {
    const shopContainer = document.getElementById("shop-container");
    const loadButton = document.querySelector(".load-shop-button");
    loadButton.disabled = true;
    loadButton.textContent = "";

    try {
      const data = await fetchGraphQL(GET_SHOP_ITEMS_QUERY);
      if (data.errors) {
        throw new Error(data.errors.map((err) => err.message).join(", "));
      }
      const items = data.data.shopItemConnection.edges.map((edge) => edge.node);
      shopContainer.innerHTML = "";
      if (items.length === 0) {
        shopContainer.innerHTML = "<p>No items available in this category.</p>";
      } else {
        items.forEach((item) => {
          const itemElement = createShopItem(item);
          shopContainer.appendChild(itemElement);
        });
      }
      shopContainer.style.display = "flex";
    } catch (error) {
      console.error(error);
    } finally {
      loadButton.disabled = false;
      loadButton.textContent = "";
    }
  }

  async function handleBuy(itemId) {
    const itemElement = document.querySelector(
      `.shop-item[data-id="${itemId}"]`
    );
    const buyButton = itemElement.querySelector("button");
    const feedbackElement = document.createElement("div");
    feedbackElement.className = "item-feedback";

    const existingFeedback = buyButton.previousElementSibling;
    if (
      existingFeedback &&
      existingFeedback.classList.contains("item-feedback")
    ) {
      existingFeedback.remove();
    }

    try {
      const variables = {
        input: {
          shopItemIds: [itemId],
        },
      };
      const data = await fetchGraphQL(PURCHASE_ITEM_MUTATION, variables);
      if (data.errors) {
        const errorMsg = data.errors[0].message;
        if (errorMsg === "NOT_ENOUGH_MONEY") {
          feedbackElement.textContent = "";
          feedbackElement.style.color = "red";
          feedbackElement.classList.add("not-enough-money");
        } else {
          feedbackElement.textContent = `${errorMsg}`;
          feedbackElement.style.color = "red";
        }
      } else {
        feedbackElement.textContent = "";
        feedbackElement.style.color = "green";
        feedbackElement.classList.add("purchase-successful");
      }
    } catch (error) {
      feedbackElement.textContent = `${error.message}`;
      feedbackElement.style.color = "red";
      console.error(error);
    }

    itemElement.insertBefore(feedbackElement, buyButton);

    setTimeout(() => {
      if (feedbackElement.parentNode) {
        feedbackElement.remove();
      }
    }, 3000);
  }

  window.loadShopItems = loadShopItems;
  window.handleBuy = handleBuy;
})();
