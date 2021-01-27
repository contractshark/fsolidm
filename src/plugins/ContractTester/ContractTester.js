/*globals define*/
/*eslint-env node, browser*/

/**
 * Generated by PluginGenerator 2.20.5 from webgme on Wed Oct 14 2020 12:14:24 GMT-0400 (Eastern Daylight Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'common/util/ejs',
    'scsrc/util/utils',
    'scsrc/templates/ejsCache',
    'q'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    ejs,
    utils,
    ejsCache,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of ContractTester.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ContractTester.
     * @constructor
     */
    function ContractTester() {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    }

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructure etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    ContractTester.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    ContractTester.prototype = Object.create(PluginBase.prototype);
    ContractTester.prototype.constructor = ContractTester;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(Error|null, plugin.PluginResult)} callback - the result callback
     */
    ContractTester.prototype.main = function (callback) {
        // Use this to access core, project, result, logger etc from PluginBase.
        var self = this,
            fs;

        fs = require('fs');

        // Using the coreAPI to make changes.
        const currentNode = self.activeNode;
        var baseNode = self.core.getBase(currentNode);

        var params = {
            parent: currentNode.parent,
            base: baseNode
        };

        // console.log(validChildren);

        var all_promises = [];

        fs.readdir('./contractsForTest/', function (err, files) {
            files.forEach(function (file) {
                fs.readFile('./contractsForTest/' + file, 'utf8', function (err, contents) {
                    var newNode = self.core.createNode(params);
                    self.core.setAttribute(newNode, 'name', file.replace('.sol', ''));
                    self.core.setRegistry(newNode, 'position', { x: 70, y: 70 });

                    var validChildren = self.core.getValidChildrenMetaNodes({ node: currentNode });

                    var fNames = ContractTester.prototype.getAllFunctions(contents);

                    //Creating initial state
                    var initialState = self.core.createChild(newNode, validChildren[2]);
                    self.core.setAttribute(initialState, 'name', 'InitialState');

                    var deferred = Q.defer();
                    fNames.forEach(fn => {

                        var transition = self.core.createChild(newNode, validChildren[0]);

                        self.core.setAttribute(transition, 'name', fn.name);
                        self.core.setAttribute(transition, 'statements', fn.code);
                        self.core.setAttribute(transition, 'input', fn.inputs);
                        self.core.setAttribute(transition, 'output', fn.outputs);
                        self.core.setAttribute(transition, 'tags', fn.tags);
                        self.core.setPointer(transition, 'src', initialState);
                        self.core.setPointer(transition, 'dst', initialState);
                        // if (fn.modifiers.length > 0) {
                        //     self._client.setAttribute(transition, 'guards', fn.modifiers.join(','));
                        // }
                        deferred.resolve(fn);
                        all_promises.push(deferred.promise);
                    });

                    Q.all(all_promises)
                        .then(function (result) {
                            self.save('ContractTester updated model.')
                                .then(() => {
                                    self.result.setSuccess(true);
                                    callback(null, self.result);
                                })
                                .catch((err) => {
                                    // Result success is false at invocation.
                                    self.logger.error(err.stack);
                                    callback(err, self.result);
                                });
                        });

                });
            });
        });

    };

    ContractTester.prototype.getAllFunctions = function (contents) {
        var codeContent = contents.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*/g, '');
        //Get all modifier names
        var modifiersList = codeContent.match(/modifier [^\{}]*/g);
        var mNames = [];
        if (modifiersList) {
            for (var i = 0; i < modifiersList.length; i++) {
                var mName = {};
                mName.name = modifiersList[i].match(/modifier [^\()]*/g)[0].replace('modifier ', '');

                if (i != modifiersList.length - 1) {
                    var body = codeContent.substring(codeContent.indexOf(modifiersList[i]) + modifiersList[i].length + 1, codeContent.indexOf(modifiersList[i + 1]));
                    body = body.trim().substring(0, body.length - 2);
                    body = body.replace('_;', '').replace('}', '').replace('if (', '').replace('))', ')');
                    mName.condition = body;
                } else {
                    var body = codeContent.substring(codeContent.indexOf(modifiersList[i]) + modifiersList[i].length + 1, codeContent.indexOf('function') - 1);
                    body = body.trim().substring(0, body.length - 2);
                    body = body.replace('_;', '').replace('}', '').replace('if (', '').replace('))', ')');
                    mName.condition = body;
                }
                mNames.push(mName);
            }
        }

        //Get all function names
        var fNames = [];
        var functionDefinitionList = codeContent.match(/function [^\{}]*/g);
        if (functionDefinitionList) {
            for (var i = 0; i < functionDefinitionList.length; i++) {
                var fName = {};
                fName.definition = functionDefinitionList[i];
                fName.name = functionDefinitionList[i].match(/function [^\()]*/g)[0].replace('function ', '');
                fName.modifiers = [];
                fName.outputs = '';
                fName.inputs = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf('(') + 1, functionDefinitionList[i].indexOf(')'));
                if (functionDefinitionList[i].indexOf('returns') != -1) {
                    var returnval = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf('returns') + 1);
                    fName.outputs = returnval.substring(returnval.indexOf('(') + 1, returnval.indexOf(')'));
                    fName.tags = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf(')') + 1, functionDefinitionList[i].indexOf('returns'));
                } else {
                    fName.tags = functionDefinitionList[i].substring(functionDefinitionList[i].indexOf(')') + 1);
                }


                mNames.forEach(mn => {
                    if (functionDefinitionList[i].indexOf(mn.name) !== -1) {
                        fName.modifiers.push(mn.name);
                    }
                });

                //Moving internal function code
                if (i != functionDefinitionList.length - 1) {
                    var body = codeContent.trim().substring(codeContent.trim().indexOf(functionDefinitionList[i]) + functionDefinitionList[i].length + 1, codeContent.trim().indexOf(functionDefinitionList[i + 1]));
                    body = body.trim().substring(0, body.trim().length - 1);
                    fName.code = body;
                } else {
                    var body = codeContent.trim().substring(codeContent.trim().indexOf(functionDefinitionList[i]) + functionDefinitionList[i].length + 1, codeContent.trim().length - 1);
                    body = body.trim().substring(0, body.trim().length - 1);
                    fName.code = body;
                }

                //Loading inputs for each function

                fNames.push(fName);
            }
        }

        return fNames;
    };

    // ContractTester.prototype.createFSM = function () {
    //     var self = this,
    //         core,
    //         all_promises = [];
    //     var fNames = this.getAllFunctions();
    //     this._fNames = fNames;
    //     var node = self._client.getNode(WebGMEGlobal.State.getActiveObject());
    //     self._client.startTransaction();

    //     self._client.setAttribute(node.getId(), 'definitions', this.getVariableDefinitions());
    //     //Creating initial state
    //     var initialState = self._client.createChild({ parentId: node.getId(), baseId: '/m/z' });
    //     var deferred = Q.defer();
    //     fNames.forEach(fn => {

    //         var transition = self._client.createChild({ parentId: node.getId(), baseId: '/m/A' });

    //         self._client.setAttribute(transition, 'name', fn.name);
    //         self._client.setAttribute(transition, 'statements', fn.code);
    //         self._client.setAttribute(transition, 'input', fn.inputs);
    //         self._client.setAttribute(transition, 'output', fn.outputs);
    //         self._client.setAttribute(transition, 'tags', fn.tags);
    //         self._client.setPointer(transition, 'src', initialState);
    //         self._client.setPointer(transition, 'dst', initialState);
    //         if (fn.modifiers.length > 0) {
    //             self._client.setAttribute(transition, 'guards', fn.modifiers.join(','));
    //         }
    //         deferred.resolve(fn);
    //         all_promises.push(deferred.promise);
    //     });

    //     self._client.completeTransaction();
    //     this._fsmGenerated = true;
    //     return Q.all(all_promises);
    // };

    return ContractTester;
});