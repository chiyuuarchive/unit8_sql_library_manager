'use strict';
const Sequelize = require("sequelize");
const { Model } = Sequelize;


module.exports = (sequelize, DataTypes) => {
  class Book extends Model {} 
  Book.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,           // Title is required!
            validate: {
                notNull: {
                    msg: "Please provide the title of the book."
                },
                notEmpty: {
                    msg: "Title is required."
                }
            }
        },
        author: {
            type: Sequelize.STRING,
            allowNull: false,          // Author is required!
            validate: {
                notNull: {
                    msg: "Please provide the author name of the book."
                },
                notEmpty: {
                    msg: "Author name is required."
                }    
            }
        },
        genre: {
            type: Sequelize.STRING,
            defaultValue: "Other"
        },
        year: {
            type: Sequelize.INTEGER,
        }
    }, 
    {
      sequelize, 
      modelName: "Book"
    });

    return Book;
};
