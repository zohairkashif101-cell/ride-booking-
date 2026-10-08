const userModel = require('../models/User');

module.exports.createUser = async ({
    firstname, lastname, email, password
}) => {
    if (!firstname || !email || !password) {
        throw new Error('All fields are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await userModel.create({
        fullname: {
            firstname: firstname.trim(),
            lastname: lastname ? lastname.trim() : ''
        },
        email: normalizedEmail,
        password
    });

    return user;
};