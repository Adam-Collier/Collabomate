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
}

exports.userProjects = function (request, response) {
  return Promise.all(request.user.projects.map(function (obj) {
    var proj = obj;
    return getAllDataForProj(proj).catch(err => res.send("api failure"))
  }))
    .then((resp) => {
      const data = resp.map((projectData) => ({
        repo: projectData[1].name,
        username: projectData[1].owner.login,
        repoUrl: projectData[1].html_url,
        languages: Object.keys(projectData[2]).reduce((str, lang) => str + ' ' + lang, ''),
        difficulty: projectData[3].difficulty,
        comment: projectData[3].comment,
        README: projectData[0]
      }));
      return data;
    });
}



exports.api = function (req, res) {
  // find all of the projects from all users
  User.find({}, { _id: 0, projects: 1 }, function (err, users) {
    if (err) {
      res.send(err);
    }
    // const allProjs = users.map((x) => console.log(x.projects));
    const allProjs = users.reduce((acc, curr) => acc.concat(curr.projects), []);
    Promise.all(allProjs.map((obj) => {
      var proj = obj;
      return getAllDataForProj(proj).catch(err => res.send("api failure"));
    }))
      .then((resp) => {
        const data = resp.map((projectData) => ({
          repo: projectData[1].name,
          username: projectData[1].owner.login,
          repoUrl: projectData[1].html_url,
          languages: Object.keys(projectData[2]).reduce((str, lang) => str + ' ' + lang, ''),
          difficulty: projectData[3].difficulty,
          comment: projectData[3].comment,
          README: projectData[0]
        }));
        res.send(data);
      });
  })
}



