import { asyncHandler } from "../utils/asynicHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../modals/user.modals.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAcessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something Went Wrong While Generating Tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { email, password, username,} = req.body

    if(
        [ email, password, username].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "Fullname is Required")
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser){
        throw new ApiError(409, "User Already Exist !!!")
    }

    const user = await User.create({
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something Went Wrong While Regestration")
    }

    return res.status(201).json(
        new ApiResponse(200, "User Registered Sucessfully")
    )
})

const logedinUser = asyncHandler(async(req,res) => {
    const {email,fullName,username,password} = req.body
    if(!username & !email){
        throw new ApiError(400, "Username And Email is Required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User Does Not Exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect Password")
    }

    const {accessToken, refreshToken} = await generateAcessandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In SucessFully"
        )
    )
})

const loggedOut = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})













export {registerUser, logedinUser, loggedOut}