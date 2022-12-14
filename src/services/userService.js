import db from "../models/index";
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise( async (resolve, reject) => {
        try{
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        }catch(e){
            reject(e);
        }
    })
}
let handleUserLogin = (email, password) => {
    return new Promise( async(resovle, reject) => {
        try{
            let userData = {};

            let isExist = await checkUserEmail(email);
            if(isExist){
                // neu la true thi` user da~ co' san~
                let user = await db.User.findOne({
                    attributes: ['email', 'roleId', 'password'],
                    where: {email : email},
                    raw: true
                });
                if(user){
                    // compare mat khau
                    let check = await bcrypt.compareSync(password, user.password); //false
                    if(check){
                        userData.errCode = 0;
                        user.errMessage = 'OK';
                        
                        delete user.password;
                        userData.user = user;
                    }else{
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                }else{
                    userData.errCode = 2;
                    userData.errMessage = `User's not found~`
                }
            }else{
                // bao' loi~
                userData.errCode = 1;
                userData.errMessage = `Your's Email isn't exist in your system. Please try other email!`
            }
            resovle(userData)
        }catch(e){
            reject(e);
        }
    })
}

// let compareUserPassword = () => {
//     return new Promise (async(resovle, reject(e)) => {
//         try{

//         }catch(e){
//             reject(e)(e);
//         }
//     })
// }

let getAllUsers = (userId) => {
    return new Promise( async (resovle, reject) => {
        try{
            let users = '';
            if(userId === 'All') {
                users = await db.User.findAll({
                    attributes:{
                        exclude: ['password']
                    }
                })
            }if(userId && userId !== 'All'){
                users = await db.User.findOne({
                    where: { id: userId},
                    attributes:{
                        exclude: ['password']
                    }
                })
            }
            resovle(users)

        }catch(e){
            reject(e);
        }
    })
}
let checkUserEmail = (userEmail) => {
        return new Promise( async (resovle, reject) => {
            try{
                let user = await db.User.findOne({
                    where: { email : userEmail}
                })
                if(user){
                    resovle(true)
                }else{
                    resovle(false)
                }
            }catch(e){
                reject(e);
            }
        })
}
let createNewUser = (data) => {
    return new Promise ( async (resovle, reject) => {
        try{
            //check email is exist ????
            let check = await checkUserEmail(data.email);
            if(check === true){
                resovle({
                    errCode: 1,
                    errMessage: 'your email is already in used, please try another email!'
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })
            resolve({
                errCode: 0,
                Message: 'ok'
            })
            }   
        }catch(e){
            reject(e);
        }
    })
}
let deleteUser = (userId) => {
    return new Promise ( async (resolve, reject) =>{
        let foundUser = await db.User.findOne({
            where: { id: userId }
        })
        if(!foundUser){
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist!`
            })}
        await db.User.destroy({
            where: {id: userId}
        })
        resolve({
            errCode: 0,
            errMessage: `The user is delete`
        })
    })
}
let updateUserData = (data) => {
    return new Promise( async (resolve, ) => {
        try{
                if(!data.id){
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }
            let user = await db.User.findOne({
                where: {id: data.id},
                raw: false
            })
            if(user){
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                await user.save();
                // await db.User.save({
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address
                // }), {where :{ id: userId } }
                resolve({
                    errCode: 0,
                    errmessage: 'update user success!'
                })
            }else{
                resolve({
                    errCode: 1,
                    errMessage: 'user not found'
                });
            }
        }catch(e){
            reject(e);
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData
}     