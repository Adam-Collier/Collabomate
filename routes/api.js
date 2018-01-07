var User = require('../models/User');
var fetch = require('node-fetch');

function getAllDataForProj(proj) {
  return Promise.all([
    fetch('https://api.github.com/repos/' + proj.project.split("/").slice(-2).join("/") + '?access_token=' + process.env.GITHUB_API)
      .then(function (response) {
        return response.json();
      }),
    fetch('https://api.github.com/repos/' + proj.project.split("/").slice(-2).join("/") + '/languages?access_token=' + process.env.GITHUB_API)
      .then(function (response) {
        return response.json();
      }),
    {
      created: new Date(),
      difficulty: proj.difficulty,
      comment: proj.comment,
      id: proj._id
    }
  ])
    .catch((err) => console.log(err))
}

exports.userProjects = function (request, response) {
  return Promise.all(request.user.projects.map(function (obj) {
    var proj = obj;
    return getAllDataForProj(proj).catch(err => res.send("api failure"))
  }))
    .then((resp) => {
      const data = resp.reduce((acc, curr) => {
        if (curr[1].message != "Not Found") {
          acc.push({
            id: curr[2].id,
            repo: curr[0].name,
            username: curr[0].owner.login,
            repoUrl: curr[0].html_url,
            languages: Object.keys(curr[1]).reduce((str, lang) => str + ' ' + lang, ''),
            difficulty: curr[2].difficulty,
            comment: curr[2].comment
          })
        }
        return acc;
      }, [])
      return data;
    })
    .catch((err) => console.log("there is an error"))
}


exports.api = function (req, res) {
  // find all of the projects from all users
  return User.find({}, { _id: 0, projects: 1, createdAt: 1 }, function (err, users) {
    if (err) {
      res.send(err);
    }
    return users;
  })
  .then((users) => {
    var allProjs = users.reduce((acc, curr) => acc.concat(curr.projects), []);
    return Promise.all(allProjs.map((obj) => {
      return getAllDataForProj(obj).catch((err) => console.log(err));
    }))
      .then((resp) => {
        const data = resp.reduce((acc, curr) => {
          if (curr[1].message != "Not Found") {
            acc.push({
              repo: curr[0].name,
              username: curr[0].owner.login,
              repoUrl: curr[0].html_url,
              languages: Object.keys(curr[1]).reduce((str, lang) => str + ' ' + lang, ''),
              difficulty: curr[2].difficulty,
              comment: curr[2].comment,
              created: curr[2].created
            })
          }
          return acc;
        }, [])
        return data;
      })
      .catch((err) => console.error(err));
  })
    .catch((err) => console.error(err));
}

exports.checkRepoExists = function (req, res) {
  if (req.body) {
    req = req.body.url
  }
  return fetch('https://api.github.com/repos/' + req.split("/").slice(-2).join("/") + '/languages?access_token=' + process.env.GITHUB_API)
    .then(function (response) {
      return response.json();
    }).then((json) => {
      if (json.message == "Not Found") {
        return res == undefined ? "Repo Not Found" : res.send("Repo Not Found")
      } else {
        return res == undefined ? "Repo Exists" : res.send("Repo Exists")
      }
    })
}

exports.fetchReadme = (req, res) => {
  fetch('https://api.github.com/repos/' + req.body.url.split("/").slice(-2).join("/") + '/readme?access_token=' + process.env.GITHUB_API, {
    headers: {
      'Accept': 'application/vnd.github.v3.html'
    }
  }).then((data) => {
    return data.text();
  }).then((response) => {
    res.send(response);
  })
}



