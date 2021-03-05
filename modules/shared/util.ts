export const checkAutoplay = (): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.autoplay = true;
      audio.addEventListener("play", () => resolve(true));
      audio.addEventListener("error", () => resolve(false));
      audio.src =
        "data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
      setTimeout(() => resolve(false), 5000);
    } catch (e) {
      resolve(false);
    }
  });
