#!/usr/bin/env node
var fs = require('fs');
var yaml = require('js-yaml');

function querify(yamlFile, cb) {
    return new Promise((resolve, reject) => {
        fs.readFile(yamlFile, (err, data) => {
            if(err) {
                reject(err);
                if(cb) cb(err);
                return;
            }
            try {
                var schema = yaml.safeLoad(data.toString());
            } catch (err) {
                reject(err);
                if(cb) cb(err);
                return;
            }
            for(var i = 0; i < schema.length; i++) {
                var table = schema[i];
                var query = `CREATE TABLE IF NOT EXISTS ${table.tableName}(`;
                var first = true;
                for(var column in table.schema) {
                    if(first == false) {
                        query += ", ";
                    } else {
                        first = false;
                    }
    
                    var columnObject = table.schema[column];
    
                    if(columnObject.size) {
                        query += `${column} ${columnObject.type.toUpperCase()}(${columnObject.size})`;
                    } else {
                        query += `${column} ${columnObject.type}`;
                    }
    
                    if (columnObject.primaryKey == true) {
                        query += " PRIMARY KEY";
                    }
                    if (columnObject.unique == true) {
                        query += " UNIQUE";
                    }
                    if (columnObject.notNull == true) {
                        query += " NOT NULL";
                    }
    
                    if(columnObject.foreignKey) {
                        var foreignKey = columnObject.foreignKey;
                        query += `, FOREIGN KEY(${column}) REFERENCES ${foreignKey.table}(${foreignKey.column})`;
                    }
                }
    
                if (table.unique) {
                    query += `, UNIQUE(${table.unique.join(', ')})`;
                }
                if (table.primaryKey) {
                    query += `, PRIMARY KEY(${table.primaryKey.join(', ')})`;
                }
                query += ");\r\n";
            }
            resolve(query);
            if(cb) cb(undefined, query);
        });
    });
};

var args = process.argv.splice(process.execArgv.length + 2);

// Retrieve the first argument
var fileName = args[0];

querify(fileName)
    .then(query => {
        console.log(query);
    })
    .catch(err => {
        console.error(err);
    });