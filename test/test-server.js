const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Blog Post", function() {
  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the that promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer();
  });

  // although we only have one test module at the moment, we'll
  // close our server at the end of these tests. Otherwise,
  // if we add another test module that also has a `before` block
  // that starts our server, it will cause an error because the
  // server would still be running from the previous tests.
  after(function() {
      return closeServer();
	});
	
	// test strategy:
  //   1. make request to `/shopping-list`
  //   2. inspect response object and prove has right code and have
  //   right keys in response object.
  it("should list items on GET", function() {
    // for Mocha tests, when we're dealing with asynchronous operations,
    // we must either return a Promise object or else call a `done` callback
    // at the end of the test. The `chai.request(server).get...` call is asynchronous
    // and returns a Promise, so we just return it.
    return chai
      .request(app)
      .get("/blog-posts")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");

        // because we create three items on app load
        expect(res.body.length).to.be.at.least(1);
        // each item should be an object with key/value pairs
        const expectedKeys = ["title", "id", "author", "content", "publishDate"];
        res.body.forEach(function(item) {
          expect(item).to.be.a("object");
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

	 // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it("should add an item on POST", function() {
		const newPost = {
			title: "bake like a Pro",
			content: "Just buy a cake",
			author: "cake master"
		};
		const expectedKeys = ["id", "publishDate"].concat(Object.keys(newPost));
		return chai	
			.request(app)
			.post("/blog-posts")
			.send(newPost)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a("object");
				expect(res.body).to.have.all.keys(expectedKeys);
				expect(res.body.title).to.equal(newPost.title);
				expect(res.body.content).to.equal(newPost.content);
				expect(res.body.author).to.equal(newPost.author);
			});
	});
		
		it("should error if POST missing expected values", function(){
			const badRequestData = {};
			return chai 	
				.request(app)
				.post("/blog-posts")
				.send(badRequestData)
				.then(function(res) {
					expect(res).to.have.status(400);
				});
		});
	
  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.
  it("should update items on PUT", function() {
		return(
			chai
				.request(app)
				.get("/blog-posts")
				.then(function(res) {  
					const updatedPost = Object.assign(res.body[0], {
						title: "bake a cake",
						content: "turn on the oven"
					});
					return chai
						.request(app)
						.put(`/blog-posts/${res.body[0].id}`)
						.send(updatedPost)
						.then(function(res) {
							expect(res).to.have.status(204);
						});
				})
		);
	});
	
	// test strategy:
  //  1. GET blog posts so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it("should delete items on DELETE", function() {
    return (
      chai
        .request(app)
        // first have to get so we have an `id` of item
        // to delete
        .get("/blog-posts")
        .then(function(res) {
          return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });
});

