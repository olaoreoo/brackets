/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */
/*global module, require*/
module.exports = function (grunt) {
    'use strict';

    // load dependencies
    grunt.loadTasks('tasks');
    
    [
        'grunt-contrib-jasmine',
        'grunt-contrib-jshint',
        'grunt-contrib-watch',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-contrib-concat',
        'grunt-contrib-less',
        'grunt-jasmine-node',
        'grunt-usemin'
    ].forEach(function (task) { grunt.loadNpmTasks(task); });

    var common = require("./tasks/lib/common")(grunt);
    
    // Project configuration.
    grunt.initConfig({
        pkg  : grunt.file.readJSON("package.json"),
        clean: {
            dist: ['dist']
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dest: 'dist/',
                        cwd: 'src/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        dest: 'dist/css',
                        cwd: 'src/styles',
                        src: ['fonts/**', 'images/**']
                    }
                ]
            }
        },
        less: {
            css: {
                files: {
                    "src/styles/brackets.css": "src/styles/brackets.less"
                }
            }
        },
        useminPrepare: {
            html: ['dist/index.html']
        },
        usemin: {
            html: ['dist/index.html'],
            options: {
                dirs: ['dist/']
            }
        },
        meta : {
            src   : [
                'src/**/*.js',
                '!src/thirdparty/**',
                '!src/widgets/bootstrap-*.js',
                '!src/extensions/**/unittest-files/**/*.js',
                '!src/extensions/**/thirdparty/**/*.js',
                '!src/extensions/dev/**',
                '!src/extensions/disabled/**',
                '!**/node_modules/**/*.js',
                '!src/**/*-min.js',
                '!src/**/*.min.js'
            ],
            test : [
                'test/**/*.js',
                '!test/perf/*-files/**/*.js',
                '!test/spec/*-files/**/*.js',
                '!test/smokes/**',
                '!test/temp/**',
                '!test/thirdparty/**',
                '!test/**/node_modules/**/*.js'
            ],
            grunt: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],
            /* specs that can run in phantom.js */
            specs : [
                'test/spec/CommandManager-test.js',
                //'test/spec/LanguageManager-test.js',
                //'test/spec/PreferencesManager-test.js',
                'test/spec/ViewUtils-test.js'
            ]
        },
        watch: {
            all : {
                files: ['**/*', '!**/node_modules/**'],
                tasks: ['jshint']
            },
            grunt : {
                files: ['<%= meta.grunt %>', 'tasks/**/*'],
                tasks: ['jshint:grunt']
            },
            src : {
                files: ['<%= meta.src %>', 'src/**/*'],
                tasks: ['jshint:src']
            },
            test : {
                files: ['<%= meta.test %>', 'test/**/*'],
                tasks: ['jshint:test']
            }
        },
        /* FIXME (jasonsanjose): how to handle extension tests */
        jasmine : {
            src : 'undefined.js', /* trick the default runner to run without importing src files */
            options : {
                junit : {
                    path: 'test/results',
                    consolidate: true
                },
                specs : '<%= meta.specs %>',
                /* Keep in sync with test/SpecRunner.html dependencies */
                vendor : [
                    'src/thirdparty/jquery-2.0.1.min.js',
                    'src/thirdparty/CodeMirror2/lib/codemirror.js',
                    'src/thirdparty/CodeMirror2/lib/util/dialog.js',
                    'src/thirdparty/CodeMirror2/lib/util/searchcursor.js',
                    'src/thirdparty/CodeMirror2/addon/edit/closetag.js',
                    'src/thirdparty/CodeMirror2/addon/selection/active-line.js',
                    'src/thirdparty/mustache/mustache.js',
                    'src/thirdparty/path-utils/path-utils.min',
                    'src/thirdparty/less-1.4.2.min.js'
                ],
                helpers : [
                    'test/spec/PhantomHelper.js'
                ],
                template : require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfig : {
                        baseUrl: 'src',
                        paths: {
                            'test' : '../test',
                            'perf' : '../test/perf',
                            'spec' : '../test/spec',
                            'text' : 'thirdparty/text/text',
                            'i18n' : 'thirdparty/i18n/i18n'
                        }
                    }
                }
            }
        },
        'jasmine_node': {
            projectRoot: 'src/extensibility/node/spec/'
        },
        jshint: {
            all: [
                '<%= meta.grunt %>',
                '<%= meta.src %>',
                '<%= meta.test %>'
            ],
            grunt:  '<%= meta.grunt %>',
            src:    '<%= meta.src %>',
            test:   '<%= meta.test %>',
            /* use strict options to mimic JSLINT until we migrate to JSHINT in Brackets */
            options: {
                jshintrc: '.jshintrc'
            }
        },
        shell: {
            repo: grunt.option("shell-repo") || "../brackets-shell",
            mac: "<%= shell.repo %>/installer/mac/staging/<%= pkg.name %>.app",
            win: "<%= shell.repo %>/installer/win/staging/<%= pkg.name %>.exe",
            linux: "<%= shell.repo %>/installer/linux/debian/package-root/opt/brackets/brackets"
        }
    });
    
    // task: install
    grunt.registerTask('install', ['write-config']);

    // task: test
    grunt.registerTask('test', ['jshint:all', 'jasmine']);
//    grunt.registerTask('test', ['jshint:all', 'jasmine', 'jasmine_node']);

    // task: set-sprint
    // Update sprint number in package.json and rewrite src/config.json
    grunt.registerTask('set-sprint', ['update-sprint-number', 'write-config']);

    // Default task.
    grunt.registerTask('default', [
        'less', 'test', 'clean', 'copy',
        'useminPrepare',
        'concat', 'uglify', 'cssmin',
        'usemin'
    ]);
};
