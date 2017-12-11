var User = require('../models/User');
var fetch = require('node-fetch');

function getAllDataForProj(proj) {
  return Promise.all([
    fetch('https://api.github.com/repos/' + proj.project.split("/").slice(-2).join("/") + '/readme?access_token=' + process.env.GITHUB_API, {
      headers: {
        'Accept': 'application/vnd.github.v3.html'
      }
    })
      .then(function (response) {
        return response.text();
      }),
    fetch('https://api.github.com/repos/' + proj.project.split("/").slice(-2).join("/") + '?access_token=' + process.env.GITHUB_API)
      .then(function (response) {
        return response.json();
      }),
    fetch('https://api.github.com/repos/' + proj.project.split("/").slice(-2).join("/") + '/languages?access_token=' + process.env.GITHUB_API)
      .then(function (response) {
        return response.json();
      }),
    {
      difficulty: proj.difficulty,
      comment: proj.comment
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
            repo: curr[1].name,
            username: curr[1].owner.login,
            repoUrl: curr[1].html_url,
            languages: Object.keys(curr[2]).reduce((str, lang) => str + ' ' + lang, ''),
            difficulty: curr[3].difficulty,
            comment: curr[3].comment,
            README: curr[0]
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
  User.find({}, { _id: 0, projects: 1 }, function (err, users) {
    if (err) {
      res.send(err);
    }
    const allProjs = users.reduce((acc, curr) => acc.concat(curr.projects), []);
    return Promise.all(allProjs.map((obj) => {
      var proj = obj;
      return getAllDataForProj(proj).catch((err) => console.log(err));
    }))
      .then((resp) => {
        const data = resp.reduce((acc, curr) => {
          if (curr[1].message != "Not Found") {
            acc.push({
              repo: curr[1].name,
              username: curr[1].owner.login,
              repoUrl: curr[1].html_url,
              languages: Object.keys(curr[2]).reduce((str, lang) => str + ' ' + lang, ''),
              difficulty: curr[3].difficulty,
              comment: curr[3].comment,
              README: curr[0]
            })
          }
          return acc;
        }, [])
        res.send(data);
      })
      .catch((err) => console.error(err));
  })
}

exports.checkRepoExists = function(req, res) {
  console.log(req.body);
  
  fetch('https://api.github.com/repos/' + req.body.url.split("/").slice(-2).join("/") + '/languages?access_token=' + process.env.GITHUB_API)
    .then(function (response) {
      return response.json();
    }).then((json) => {
      console.log(json);
      if (json.message == "Not Found"){
        res.send("Repo Not Found")
      }else{
        res.send("Repo Exists");
      }
    })
}



