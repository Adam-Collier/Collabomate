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

  var fetchAPI = () => {
    fetch('/api').then(
      (response) => response.json()
    )
      .then((projects) => {
        projects.forEach(function (x) {
          var projectCard = `
          <div class="project">
            <div>
              <div>
                <h2 class="name">${x.repo}</h2>
                <p class="username">${x.username}</p>
                <a href="${x.repoUrl}" class="repo">Github repo</a>
              </div>
              <div>
                <p class="level">${x.difficulty}</p>
              </div>
            </div>
            <div>
              <h4>comment</h4>
              <p class="comment">${x.comment}</p>
            </div>
            <div>
              <div>
                <p class="readme">README</p>
                <?xml version="1.0" standalone="no"?>
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <svg width="100%" height="100%" viewBox="0 0 5 6" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                  xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;">
                  <path d="M4.154,2.505l-4.154,2.506l0,-5.011l4.154,2.505Z" style="fill:#000;" />
                </svg>
              </div>
              <p class="languages">${x.languages}</p>
            </div>
            <div class="github-readme">
              ${x.README}
            </div>
          </div>
        `
          document.querySelector('.projects').insertAdjacentHTML('beforeend', projectCard);
        })
      })
      .then(() => {
        document.querySelectorAll('.project > div:nth-of-type(3)').forEach(function (x) {
          x.addEventListener('click', function () {
            console.log(this);
            var readme = this.parentElement.parentElement;
            this.querySelector('svg').classList.toggle('arrow')

            if (this.nextElementSibling.style.maxHeight) {
              this.nextElementSibling.style.maxHeight = null;
            } else {
              this.nextElementSibling.style.maxHeight = this.nextElementSibling.scrollHeight + "px";
            }
          })
        })
      })
      .catch((err) => document.querySelector('.projects').innerHTML = "api not responding")
  }

  var inputFocus = (login) => {
    setTimeout(() => {
      login.parentElement.querySelector('input#email').focus();
    }, 100);
  }

  var checkRepoExists = debounce(function (input) {
      console.log(input.value.match(/\//g).length);
      if (input.value.length < 18 || input.value.match(/\//g).length < 2) {
        input.style.borderColor = "red";
      } else if (input.value.match(/(^https:\/\/github.com|^http:\/\/github.com)/)) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/checkRepoExists');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log('successful post request');
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
      console.log("blah");
    }, 250)
  return { fetchAPI, inputFocus, checkRepoExists};
})();