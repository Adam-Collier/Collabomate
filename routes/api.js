var User = require('../models/User');
var fetch = require('node-fetch');

function getAllDataForProj(proj) {
  return Promise.all([
    fetch('https://api.github.com/repos/' + proj.project.split("/").slice(-2).join("/") + '/readme?' + process.env.GITHUB_API, {
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
        console.log(resp[0][2]);
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
    //   // all of our projects will be pushed into this empty array
    //   var githubProjects = [];
    //   // an empty array for Promise.all
    //   var promises = [];
    //   actualAllprojs.map(function (x) {
    //     // get the part we need from the Github URL
    //     x = x.split("/").slice(-2).join("/");

    //     promises.push(Promise.all([
    //       fetch('https://api.github.com/repos/' + x + '/readme?access_token=7e2e631b4e111f26441a5c76f1e8b452d5d009e6', {
    //         headers: {
    //           'Accept': 'application/vnd.github.v3.html'
    //         }
    //       }).then(function (response) {
    //         return response.text();
    //       }),
    //       fetch('https://api.github.com/repos/' + x + '?access_token=7e2e631b4e111f26441a5c76f1e8b452d5d009e6').then(function (response) {
    //         return response.json();
    //       }),
    //       fetch('https://api.github.com/repos/' + x + '/languages?access_token=7e2e631b4e111f26441a5c76f1e8b452d5d009e6').then(function (response) {
    //         return response.json();
    //       })
    //     ])
    //       .then(function (res) {

    //         var languages = '';
    //         Object.keys(res[2]).forEach(function (x) {
    //           languages += x + ' ';
    //         })

    //         githubProjects.push({
    //           repo: res[1].name,
    //           username: res[1].owner.login,
    //           repoUrl: res[1].html_url,
    //           languages: languages.trim(),
    //           README: res[0]
    //         });
    //       })
    //     )
    //   })
    //   // When all promises collected promise all is thennable
    //   Promise.all(promises).then(function () {
    //     res.send(githubProjects);
    //   })


