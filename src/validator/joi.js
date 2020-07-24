const Joi = require('joi');

const newsValidator = (news) => {
    const schema = Joi.object({
        name: Joi.string().min(3),
        cat: Joi.string(),
        title: Joi.string(),
        author: Joi.string(),
        media: Joi.string(),
        content: Joi.string(),
    });
    return schema.validate(news);
};

module.exports = { newsValidator };
