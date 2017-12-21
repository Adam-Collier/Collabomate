var app = (function () {

  const debounce = (func, delay) => {
    let inDebounce
    return function () {
      const context = this
      const args = arguments
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => func.apply(context, args), delay)
    }
  }

  var inputFocus = (login) => {
    setTimeout(() => {
      login.parentElement.querySelector('input#email').focus();
    }, 100);
  }

  var checkRepoExists =
    debounce(function (input) {
      if (input.value.length < 18 ||
        input.value == null ||
        input.value.match(/\//g).length < 2) {
        input.style.borderColor = "red";
      } else if (input.value.match(/(^https:\/\/github.com|^http:\/\/github.com)/)) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/checkRepoExists');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
          if (xhr.status === 200) {
            if (xhr.responseText == "Repo Not Found") {
              input.style.borderColor = "red";
            } else {
              input.style.borderColor = "green";
            }
          }
          else if (xhr.status !== 200) {
            console.log('Request failed.  Returned status of ' + xhr.status);
          }
        }
        xhr.send("url=" + input.value);
      }
    }, 250);

    var showReadme = (readmeClick) => {
      readmeClick.querySelector('svg').classList.toggle('arrow');
      let readmeDiv = readmeClick.nextElementSibling;
      if (readmeDiv.style.maxHeight) {
        readmeDiv.style.maxHeight = null;
      } else {
        readmeDiv.style.maxHeight = readmeDiv.scrollHeight + "px";
      }
    }

  return { inputFocus, checkRepoExists, showReadme };
})();