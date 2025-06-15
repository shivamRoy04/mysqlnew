Create Table user(
    id INT primary key,
    username VARCHAR(30) UNIQUE,
    email VARCHAR(40) UNIQUE NOT NULL,
    password Varchar(30) NOT NULL

);
 