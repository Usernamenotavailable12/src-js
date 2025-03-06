setTimeout(() => {
  fetchWheelData()
    .then((data) => {
      if (data?.length > 0) {
        selectFortuneWheel(data[0],1)
      }});
}, 2000);
