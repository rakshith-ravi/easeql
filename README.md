# EaseQL

A simple command line utility that lets you generate SQL commands from documentation. The command takes in a YAML file (which is as human-readable as it gets) and generates the SQL commands from that.  
**The command will only create tables that doesn't exist so you can safely add tables to the documentation and run the command again**

## Installation

```sh
npm install -g easeql
```

## Running and using it

In order to run it, simply call the command and pass the `.yaml` file to the command line utility.

```sh
easeql database.yaml
```

This will print the SQL queries to be executed to the console.

If you require the SQL commands to be written to a file in order to be passed to the SQL as input later on, just pipe the output to a file.

```sh
easeql database.yaml > queries.sql
```

## Example YAML format (a piece of code is worth a thousand words)

```yaml
## Declare tables as list items, with the name compulsorily as "tableName", followed by the actual table name
-   tableName: "users"
    schema:
        # declare columns like so
        username:
            type: "varchar"
            size: 36
            # Declare primary keys like so
            primaryKey: true
        email:
            type: "varchar"
            size: 150
            # Unique and not null identifiers are accepted too
            unique: true
            notNull: true
        password:
            type: "varchar"
            size: 64
        phone:
            # Any SQL accepted data-type is allowed
            type: "int"
            size: 10
        dob:
            type: "int"
            size: 15
        bio:
            # Don't mention the size for data-types without a size
            type: "text"

-   tableName: "password_resets"
    schema:
        username:
            type: "varchar"
            size: 36
            primaryKey: true
            # Declare foreign keys by specifying what table and column it references to
            foreignKey:
                table: "users"
                column: "username"
        token:
            type: "varchar"
            size: 64
        tokenExpiry:
            type: "int"
            size: 15

-   tableName: "blog_comments_likes"
    schema:
        commentId:
            type: "varchar"
            size: 36
            foreignKey:
                table: "comments"
                column: "commentId"
        username:
            type: "varchar"
            size: 36
            foreignKey:
                table: "users"
                column: "username"
    # Composite primary keys are mentioned outside the "schema" object
    primaryKey:
        - commentId
        - username

-   tableName: "i_ran_out_of_ideas_for_table_names_sorry"
    schema:
        someRandomColumnName:
            type: "varchar"
            size: 25
        anotherRandomColumnName:
            type: "bigint"
    # Composite unique keys are allowed too
    unique:
        - someRandomColumnName
        - anotherRandomColumnName
```

...will translate to the following (prettified for easier readability):

```SQL
CREATE TABLE IF NOT EXISTS users
(
    username VARCHAR(36) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(64),
    phone INT(10),
    dob INT(15),
    bio TEXT
);

CREATE TABLE IF NOT EXISTS password_resets
(
    username VARCHAR(36) PRIMARY KEY,
    FOREIGN KEY(username) REFERENCES users(username),
    token VARCHAR(64),
    tokenExpiry INT(15)
);

CREATE TABLE IF NOT EXISTS blog_comments_likes
(
    commentId VARCHAR(36),
    FOREIGN KEY(commentId) REFERENCES comments(commentId),
    username VARHCAR(36),
    FOREIGN KEY(username) REFERENCES users(username),
    PRIMARY KEY(commentId, username)
);

CREATE TABLE IF NOT EXISTS i_ran_out_of_ideas_for_table_names_sorry
(
    someRandomColumnName VARCHAR(25),
    anotherRandomColumnName BIGINT,
    UNIQUE(someRandomColumnName, anotherRandomColumnName)
);
```

## License

This piece of code is distributed under the GNU GPLv3 License.  
If you are using this software, please give due credits to the authors.