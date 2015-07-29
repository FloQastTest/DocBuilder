var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  

var winston = require('winston');

var DocBuilder = require('../DocBuilder/DocBuilder');


 

  var url = 'http://localhost';
  var docBuilder = new DocBuilder(url);
  
  
  describe('/api/user',function(){
    var currCSRF;
    it('GET: should return a csrfToken', function(done){
      this.timeout(10000);
      docBuilder
        .get("/api/user")
        .name("GetCSRF")
        .group("User")
        .description("returns session csrfToken")
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err,res){
            if (err){
              throw new Error(err);
            }
            
            res.body.should.have.property('csrfToken');
            docBuilder.successExample(res.body);
 
            done();
            
            
        });
      });

    after(function(){


    docBuilder.done().build().toFile("./genDoc/userDoc.js",function(err,state){
      if (err) throw new Error(err);
      console.log(state);
    });

   }); 

  });
