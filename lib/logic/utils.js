function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  function switchPage(pageKey) {
    Object.values(pages).forEach(p => p.classList.remove("active-page"));
    pages[pageKey].classList.add("active-page");
  }


  