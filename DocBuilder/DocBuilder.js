var request = require('supertest');
var validator = require('validator');
var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

/**
 * @class DocBuilder provides wrapper for supertest request module
 * builds out live API docs according to supertest request methods used
 * @chainable
 * @param {url} url of request
 */
var DocBuilder = function(url){
	var url = url;
	var doc = "/** \n";

	var endPointArray = [];

	var currEndpoint = null;

	/**
	 * @private
	 * @property {RequestClass} requ Supertest request class held as private property
	 * @type {RequestClass}
	 */
	var requ = request(url);

	/**
	 * @class EndPointModel provides class blueprint for EndPointRequests
	 */
	var EndPointModel = function(){
		this.name = null;
		//group ex UserGroup (for styling?)
		this.group = null;
		//desc ex gets user codes
		this.desc = null;
		//ex get
		this.method = null;
		//ex /api/login
		this.endpoint = null;
		//obj
		this.param = null;
		//obj
		this.successDesc = null;
		//obj
		this.successExample = null;		

		this.errorDes = null;
		//obj
		this.errorExample = null;
		//ex 200
		this.httpSuccessCode = null;
		//ex 404
		this.httpErrorCode = null;
		//ex 500
		this.httpOtherCode = null;
	}
		
	
	/**
	 * @function formatObject accepts js object and makes human readable
	 * @param  {Object} obj js object
	 * @return {String} human readable obj
	 */
	var formatObject = function(obj){
		var str = JSON.stringify(obj);
		str = str.replace("{","{ \n");
		str = str.replace("}","\n }");
		str = str.replace(",",", \n");
		return str;
	}


	

	/**
	 * @function get wrapper for request get, adds to endpoint model
	 * @param  {String} endpoint REST endpoint url
	 * @return {DocBuilder} Return this for fluent 
	 */
	DocBuilder.prototype.get = function(endpoint){

		requ = requ.get(endpoint) || requ;
		var newEndpoint = new EndPointModel();
		newEndpoint.method = "get";
		newEndpoint.endpoint = endpoint;
		
		currEndpoint = newEndpoint;
		
		return this;
	}

	/**
	 * @function post wrapper for request post, adds to endpoint model
	 * @param  {String} endpoint REST endpoint url
	 * @return {DocBuilder} Return this for fluent 
	 */
	DocBuilder.prototype.post = function(endpoint){
		requ = requ.post(endpoint) || requ;
		var newEndpoint = new EndPointModel();
		newEndpoint.method = "post";
		newEndpoint.endpoint = endpoint;
		
		currEndpoint = newEndpoint;
		
		return this;
	}

	/**
	 * @function send wrapper for request send
	 * @param {Object} obj object to send to rest endpoint, updates endpoint model
	 * @return {DocBuilder} Return this for fluent 
	 */
	DocBuilder.prototype.send = function(obj){
		requ.send(obj);
		//need to add to endpoint model
		for (var key in obj){

		}
		return this;
	}

	/**
	 * @function set wrapper for request set, sets headers
	 * @param {String} header header key to set
	 * @param {String} type   header value to set
	 */
	DocBuilder.prototype.set = function(header,type){
		
		requ.set(header,type);
		return this;
	}

	/**
	 * @function expect wrapper for request expect, provides HTTP assertations
	 * @param  {*} header key or value to set 
	 * @param  {*} type   value to set if header param is set
	 * @return {DocBuilder}  this for chainable
	 */
	DocBuilder.prototype.expect = function(header,type){
		if (typeof header === "number"){
			requ.expect(header);
			if (validator.isInt(header,{min: 200, max: 299})){
				currEndpoint.httpSuccessCode = header;
			}
			else if (validator.isInt(header,{min: 400, max: 499})){
				currEndpoint.httpErrorCode = header;
			}
			else {
				currEndpoint.httpOtherCode = header;
			}

			

			
		}
		else if (typeof header === "string"){
			requ.expect(header,type);
			
			type = type.toString();
	    	type = type.replace(/\//g, '');
		}
		
		

		return this;
	}
 

	/**
	 * @function description sets currEntpoint.desc property
	 * @param  {String} desc String to describe endpoint request
	 * @return {DocBuilder}      Fluent
	 */
	DocBuilder.prototype.description = function(desc){
		currEndpoint.desc = desc;
		return this;
		//doc += "* @apiSuccessExample"
	}


	DocBuilder.prototype.name = function(name){
		currEndpoint.name = name;
		return this;
	}

	DocBuilder.prototype.group = function(group){
		currEndpoint.group = group;
		return this;
	}

	DocBuilder.prototype.successExample = function(obj){
		currEndpoint.successExample = obj;
		//var str = formatObject(obj);
		//doc += "* @apiSuccessExample"
		return this;
	}

	DocBuilder.prototype.successDesc = function(obj){
		currEndpoint.successDesc = obj;
		//var str = formatObject(obj);
		//doc += "* @apiSuccessExample"
		return this;
	}

	DocBuilder.prototype.errorExample = function(obj){
		currEndpoint.errorExample = obj;
		//doc += "* @apiSuccessExample"
		return this;
	}

	DocBuilder.prototype.errorDesc = function(obj){
		currEndpoint.errorDesc = obj;
		//var str = formatObject(obj);
		//doc += "* @apiSuccessExample"
		return this;
	}

	/**
	 * @function end callback when request is completed
	 * @param  {Function} cb callback when request is completed
	 * @callback {Function} callback which is called when request is completed
	 * @return {DocBuilder}      fluent
	 */
	DocBuilder.prototype.end = function(cb){
		
		var self = this;
		requ.end(function(err,res){
			cb && cb(err,res);
		});
		return this;
	}

	/**
	 * @function build iterates through test endpoints and concatenates
	 * api doc strings to doc variable
	 * @chainable
	 * @return {DocBuilder}
	 */
	DocBuilder.prototype.build = function(){
		
		try {
		for (var i = 0; i < endPointArray.length; i++) {
			var x = endPointArray[i];
			if (x.method != null){
				doc += "* @api {" + x.method + "} ";
				if (x.endpoint != null){
					doc += x.endpoint + " ";
					if (x.description != null){
						doc += x.desc + " ";
					}
				}
				doc += "\n";
			}
			if (x.name != null){
				doc += "* @apiName " + x.name + "\n";
			}
			if (x.group != null){
				doc += "* @apiGroup " + x.group + "\n";
			}
			if (x.param != null){

			}			
			if (x.successExample != null){
				for (var key in x.successExample){
					doc += "* @apiSuccess {" + typeof key + "} " + key + " ";
					if (x.successDesc != null){
						doc += x.successDesc[key];
					}
					doc += "\n";
				}
				doc += "* @apiSuccessExample Success-Response: \n";
				doc += "* 	 HTTP/1.1 ";
				if (x.httpSuccessCode != null){
					//need to lookup what error code means!
					doc += x.httpSuccessCode + " ";
				}
				doc += "\n";
				doc += "* " + formatObject(x.successExample) + "\n";
			}


			if (x.errorExample != null){
				doc += "* apiError ";
				if (x.errorDesc != null){
					doc += x.errorDesc;
				}
				doc += "\n";
				doc += "* @apiErrorExample Error-Response: \n";
				if (x.httpErrorCode != null){
					doc += "* HTTP/1.1 " + x.httpErrorCode;	
				}
				
				doc += "* " + formatObject(x.errorExample) + "\n";


			}
			
			
			doc += "*/";
			}
		}
		catch (e){
			throw new Error(e);
		}
		return this;
	}

	//syntax helper function
	DocBuilder.prototype.next = DocBuilder.prototype.done;

	//pushes current enpoint to array 
	//moves to next endpoint definition
	/**
	 * @function done pushes current endpoint to array, moves to next endpoint definition
	 * @return {Function} 
	 */
	DocBuilder.prototype.done = function(){
		try {
			endPointArray.push(currEndpoint);
		
			currEndpoint = null;
		
			//reset request 
			requ = request(url);
			return this;
		}
		catch (e){
			throw new Error(e);
		}
		
	}

	DocBuilder.prototype.string = function(){
		return doc;
	}

	/**
	 * @function toFile write current built string to file, and run apidocs command
	 * @param  {String}   fileName filename to save doc api string to
	 * @param  {Function} cb       callback to call when completed
	 * @return {null}            
	 */
	DocBuilder.prototype.toFile = function(fileName, cb){
		



		//var command = "apidoc -i " + fileName + " -o " + fileName + "/genDocs";
			
			
		
		//callback currently fails, must troubleshoot
		fs.writeFile(fileName,doc,null,function(err){
			
			if (err) cb && cb(err);
			cb && cb(null, true);
		});
		


		

	}

	
}



module.exports = DocBuilder;