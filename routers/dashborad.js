const express = require("express");
const router = express.Router();
const registration = require("../model/registration");
const stake2 = require("../model/stake");
const moment = require("moment-timezone");
const WithdrawalModel = require("../model/withdraw");
const { verifyToken } = require("../Middleware/jwtToken");
const { compareSync } = require("bcrypt");
const SlotPurchased = require("../model/slotPurchased");
const UserIncome = require("../model/userIncome");
const newuserplace = require("../model/newuserplace");
const LevelIncome = require("../model/LevelIncome");
const cron = require("node-cron");
const AsyncLock = require("async-lock");
const Web3 = require("web3");
const Profile = require("../model/Profile");
const reEntry = require("../model/reEntry");
const MemberIncome = require("../model/MemberIncome");
const admin_login = require("../model/admin_login");
const GlobalUplineIncome = require("../model/GlobalUplineIncome");
const GlobalDownlineIncome = require("../model/GlobalDownlineIncome");
const JoinAutoPool = require("../model/JoinAutoPool");
const WithdrawPool = require("../model/WithdrawPool");
// const reEntry = require("../model/reEntry");
const lock = new AsyncLock();

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.RPC_URL, {
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 15,
      onTimeout: false,
    },
  })
);

const ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"reciever","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"}],"name":"GlobalDownlineIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"reciever","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"}],"name":"GlobalUplineIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"JoinAutoPool","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"reciever","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"}],"name":"LevelIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"place","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"}],"name":"NewUserPlace","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"uint256","name":"userId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"referrerId","type":"uint256"}],"name":"Registration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"}],"name":"UserIncome","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"WithdrawPool","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"onOwnershipTransferred","type":"event"},{"inputs":[],"name":"ETHER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"JOINING_AMT_GLOBAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"JOINING_AMT_HYPERLOOP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LAST_LEVEL","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LAST_LEVEL_GLOBAL","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_WITHDRAWAL_HYPERFLOW","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDT","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decentra","outputs":[{"internalType":"contract IDecentraSalary","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"level","type":"uint8"}],"name":"findReferrer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"freeJoiningEnable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"level","type":"uint8"}],"name":"getLevelMember","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"globalUser","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"bool","name":"isActivated","type":"bool"},{"internalType":"uint256","name":"avlAmount","type":"uint256"},{"internalType":"uint256","name":"totalIncome","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"idToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_usdt","type":"address"},{"internalType":"address","name":"_decentraSalary","type":"address"},{"internalType":"address","name":"_owner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isUserExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"joinGlobalTeam","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_referral","type":"address"}],"name":"joinHyperLoop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"lastUserId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"_isFree","type":"bool"}],"name":"setFreeEnableAutoGlobal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"userIncome","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"partnersCount","type":"uint256"},{"internalType":"uint256","name":"levelIncome","type":"uint256"},{"internalType":"uint256","name":"uplineBonus","type":"uint256"},{"internalType":"uint256","name":"downlineBonus","type":"uint256"},{"internalType":"uint256","name":"avlReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawGlobalPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawHyperflow","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"x8CurrentvId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"x8Index","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"x8Matrix","outputs":[{"internalType":"address","name":"upline","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"","type":"uint8"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"x8vId_number","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]

const contract = new web3.eth.Contract(ABI, process.env.MAIN_CONTRACT);

router.get("/dashboard", async (req, res) => {
  const { address } = req.query;
  console.log(address, "address");

  try {
    // Find the user
    const user = await registration.findOne({ user: address });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    // Fetch income records from both collections
    const userIncomeRecords = await UserIncome.find({ receiver: address });
    const levelIncomeRecords = await LevelIncome.find({ receiver: address });
    const totalWithdraw = await WithdrawalModel.find({ user: address });

    // Calculate totals
    const totalUserIncome = userIncomeRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const totalLevelIncome = levelIncomeRecords.reduce(
      (sum, record) => sum + record.reward,
      0
    );

    const totalWeeklyReward = totalWithdraw.reduce(
      (sum, record) => sum + record.weeklyReward,
      0
    );

    const directReff = await registration.find({ referrer: address });

    // Create enhanced user object
    const userWithIncome = {
      ...user.toObject(), // Convert mongoose document to plain object
      userIncome: totalUserIncome,
      levelIncome: totalLevelIncome,
      directRefferer: directReff.length,
      totalWithdraw: totalWeeklyReward / 1e18,
      uid: user.uId,
    };

    res.status(200).json({
      msg: "Data fetch successful",
      success: true,
      user: userWithIncome,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error in data fetching",
      success: false,
      error: error.message,
    });
  }
});

router.get("/reEntryReport", async (req, res) => {
  const { address } = req.query;

  const ReentryData = await reEntry.find({ user: address });

  res.status(200).json({
    msg: "Data fetch successful",
    success: true,
    ReEntryData: ReentryData,
  });
});
router.get("/Matrix", async (req, res) => {
  try {
    const { address, cycle } = req.query;

    if (!address) {
      return res
        .status(400)
        .json({ msg: "Address is required", success: false });
    }

    let currentCycle = cycle
      ? Number(cycle)
      : await reEntry.countDocuments({ user: address });
    const totalCycle = await reEntry.countDocuments({ user: address });
    const userRecords = await newuserplace.find({
      referrer: address,
      cycle: currentCycle,
    });


    const mergedData = await Promise.all(
      userRecords.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.user });
        return {
          ...record.toObject(),
          userId: userDetails ? userDetails.userId : null,
        };
      })
    );
    res.status(200).json({
      msg: "Data fetch successful",
      success: true,
      user: mergedData,
      cycle: totalCycle,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error in data fetching",
      success: false,
      error: error.message,
    });
  }
});
router.get("/userIncomeByUser", async (req, res) => {
  const { receiver } = req.query;
  try {
    const user = await UserIncome.find({ receiver: receiver });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error in data fetching", success: false, error: error });
  }
});
router.get("/levelIncomeByUser", async (req, res) => {
  const { receiver } = req.query;
  try {
    const user = await LevelIncome.find({ receiver: receiver });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error in data fetching", success: false, error: error });
  }
});
router.get("/withdrawReport", async (req, res) => {
  const { address } = req.query;
  try {
    const user = await WithdrawalModel.find({ user: address });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error in data fetching", success: false, error: error });
  }
});
router.get("/directReferrer", async (req, res) => {
  let { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const data = await registration.find({ referrer: address });

  return res.status(200).json({
    data,
  });
});

router.get("/getTeam", async (req, res) => {
  const { address } = req.query;

  try {
    const userData = await registration
      .aggregate([
        { $match: { user: address } },
        {
          $graphLookup: {
            from: "Registration",
            startWith: "$user",
            connectFromField: "user",
            connectToField: "referrer",
            as: "team",
            maxDepth: 5,
            depthField: "level",
          },
        },
        { $unwind: "$team" },
        {
          $project: {
            _id: 0,
            userId: "$team.userId",
            user: "$team.user",
            referrer: "$team.referrer",
            referrerId: "$team.referrerId",
            timestamp: "$team.timestamp",
            createdAt: "$team.createdAt",
          },
        },
      ])
      .sort({ createdAt: 1 });

    const teamSize = userData.length;
    console.log(`Team size for ${address}: ${teamSize}`);

    res.json(userData);
  } catch (error) {
    console.error(`Error fetching team size for ${address}:`, error);
  }
});
router.get("/getAddressbyRefrralIdd", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const record = await registration.findOne({ uId: userId });

    res.status(200).json(record.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/getdetailbyUserId", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    const record = await registration.findOne({ user: address });

    res.status(200).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/weeklySalary", async (req, res) => {
  let { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const data = await MemberIncome.find({ user: address });

  return res.status(200).json({
    data,
  });
});
async function todayTotalIncome(address) {
  try {
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Filter for today's income for given address
    const levelIncomeToday = await LevelIncome.find({
      receiver: address,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const userIncomeToday = await UserIncome.find({
      receiver: address,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Sum rewards (make sure to convert BigInt-like numbers properly)
    const totalLevelIncome = levelIncomeToday.reduce(
      (sum, item) => sum + Number(item.reward),
      0
    );
    const totalUserIncome = userIncomeToday.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const total = totalLevelIncome + totalUserIncome;

    return total;
  } catch (err) {
    console.error("Error calculating today's income:", err);
    throw new Error("Failed to fetch today's income");
  }
}
async function weeklyTotalIncome(address) {
  try {
    const now = new Date();

    // Get current UTC day (0 = Sunday, 6 = Saturday)
    const day = now.getUTCDay();

    // Calculate start and end of current week (Sunday to Saturday)
    const startOfWeek = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - day,
        0,
        0,
        0,
        0
      )
    );

    const endOfWeek = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + (6 - day),
        23,
        59,
        59,
        999
      )
    );

    // Find matching incomes
    const levelIncome = await LevelIncome.find({
      receiver: address,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const userIncome = await UserIncome.find({
      receiver: address,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    // Sum up rewards
    const totalLevelIncome = levelIncome.reduce(
      (sum, item) => sum + Number(item.reward),
      0
    );

    const totalUserIncome = userIncome.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const total = totalLevelIncome + totalUserIncome;

    return total;
  } catch (err) {
    console.error("Error calculating weekly income:", err);
    throw new Error("Failed to fetch weekly income");
  }
}

router.put("/updateUserProfile", async (req, res) => {
  try {
    const { address, profileUrl, name } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const updatedProfile = await Profile.updateOne(
      { address }, // Filter by address
      {
        $set: {
          profileUrl,
          name,
        },
      },
      { upsert: true } // Create a new document if none matches
    );

    res
      .status(200)
      .json({ message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getUserProfile", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Fetch profile
    const profile = await Profile.findOne({ address });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const user = await registration.findOne({ user: address });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userIncomeRecords = await UserIncome.find({ receiver: address });
    const levelIncomeRecords = await LevelIncome.find({ receiver: address });
    const totalWithdraw = await WithdrawalModel.find({ user: address });

    // Calculate totals
    const totalUserIncome = userIncomeRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const totalLevelIncome = levelIncomeRecords.reduce(
      (sum, record) => sum + record.reward,
      0
    );

    const totalWeeklyReward = totalWithdraw.reduce(
      (sum, record) => sum + record.weeklyReward,
      0
    );

    // Parallel data fetching for efficiency
    const [todayIncome, weeklyIncome] = await Promise.all([
      todayTotalIncome(address),
      weeklyTotalIncome(address),
    ]);

    // Return all collected data
    res.status(200).json({
      message: "Profile fetched successfully",
      data: {
        profile,
        user,
        todayIncome,
        weeklyIncome,
        totalUserIncomes: totalUserIncome,
        totalLevelIncomes: totalLevelIncome,
        totalWithdraws: totalWeeklyReward,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
async function processWithdrawal(userAddress, hash, amount) {
  try {
    const lastWithdrawFund = await WithdrawalModel.findOne({
      user: userAddress,
    }).sort({ createdAt: -1 });
    console.log(lastWithdrawFund, "lastWithdrawFund::::");
    let prevNonce = 0;
    if (!lastWithdrawFund) {
      prevNonce = -1;
    } else {
      prevNonce = lastWithdrawFund.nonce;
    }

    const currNonce = await contract.methods.nonce(userAddress).call();
    console.log(
      currNonce,
      "currNonce:::,",
      prevNonce,
      "prevNonce:::,",
      Number(currNonce)
    );
    if (prevNonce + 1 !== Number(currNonce)) {
      throw new Error("Invalid withdrawal request!");
    }
    const vrsSign = await giveVrsForWithdrawLpc(
      userAddress,
      hash,
      Number(currNonce),
      web3.utils.toWei(amount.toString(), "ether")
    );

    return vrsSign;
  } catch (error) {
    console.error("Error in processWithdrawal:", error);
    throw error;
  }
}

function giveVrsForWithdrawLpc(user, hash, nonce, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        user,
        amount,
      };

      const account = web3.eth.accounts.privateKeyToAccount(
        process.env.Operator_Wallet
      );

      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;

      const signature = await web3.eth.sign(hash, account.address);

      const vrsValue = parseSignature(signature);
      data["signature"] = vrsValue;
      resolve({ ...data, amount });

      console.log(data, "data::::");
    } catch (error) {
      console.error("Error in signing the message:", error);
      reject(error);
    }
  });
}

function parseSignature(signature) {
  const sigParams = signature.substr(2);
  const v = "0x" + sigParams.substr(64 * 2, 2);
  const r = "0x" + sigParams.substr(0, 64);
  const s = "0x" + sigParams.substr(64, 64);

  return { v, r, s };
}
async function getTeamSize(address) {
  if (!address) {
    console.error("Invalid address provided.");
    return;
  }

  try {
    const userData = await registration
      .aggregate([
        { $match: { user: address } },
        {
          $graphLookup: {
            from: "Registration",
            startWith: "$user",
            connectFromField: "user",
            connectToField: "referrer",
            as: "team",
            maxDepth: 5,
            depthField: "level",
          },
        },
        { $unwind: "$team" },
        {
          $project: {
            _id: 0,
            userId: "$team.userId",
            user: "$team.user",
            referrer: "$team.referrer",
            referrerId: "$team.referrerId",
            timestamp: "$team.timestamp",
            createdAt: "$team.createdAt",
          },
        },
      ])
      .sort({ createdAt: 1 });

    const teamSize = userData.length;
    console.log(`Team size for ${address}: ${teamSize}`);

    let incomeToAdd = 0;
    if (teamSize >= 100) {
      incomeToAdd = 100;
    } else if (teamSize >= 50) {
      incomeToAdd = 50;
    } else if (teamSize >= 20) {
      incomeToAdd = 20;
    } else if (teamSize >= 10) {
      incomeToAdd = 10;
    } else if (teamSize >= 5) {
      incomeToAdd = 5;
    }

    if (incomeToAdd > 0) {
      let data = await MemberIncome.create({
        user: address,
        amount: incomeToAdd,
      });
      let user = await registration.findOne({ user: address });
      if (user) {
        user.memberIncome = (user.memberIncome || 0) + incomeToAdd;
        await user.save();
        console.log(`Updated member income for ${address}: +${incomeToAdd}`);
      } else {
        console.warn(`User not found: ${address}`);
      }
    }
  } catch (error) {
    console.error(`Error fetching team size for ${address}:`, error);
  }
}

async function getUsers() {
  try {
    const users = await registration.find().sort({ createdAt: -1 });
    return users.map((user) => user.user); // Returns an array of user addresses
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function cronCall() {
  try {
    const addresses = await getUsers();
    for (const address of addresses) {
      try {
        await getTeamSize(address);
      } catch (err) {
        console.error(`Error processing ${address}:`, err);
      }
    }
  } catch (error) {
    console.error("Cron job failed:", error);
  }
}

cron.schedule(
  "30 17 * * 0",
  async () => {
    cronCall();
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Set the timezone to Asia/Kolkata for IST
  }
);
router.get("/withdrawMemberIncome", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    // Locking the walletAddress to prevent concurrent modifications
    await lock.acquire(address, async () => {
      const fData = await registration.findOne({ user: address });
      console.log(fData, "fData:::");
      if (!fData) {
        res.status(200).json({
          status: 200,
          message: "User Not Found",
        });
      }

      const amount = fData.memberIncome;
      console.log(amount, "amount");

      if (amount < 1) {
        res.status(200).json({
          status: 200,
          message: "Insufficient Member Income minimum is $1",
        });
      }

      const currentTime = new Date();

      // Add 3 minutes (3 * 60 * 1000 milliseconds)
      const threeMinutesLater = new Date(currentTime.getTime() + 3 * 60 * 1000);

      // Convert to timestamp in milliseconds
      const timestampInMilliseconds = threeMinutesLater.getTime();

      // Generate hash and process withdrawal

      const amountBN = web3.utils.toWei(amount.toString(), "ether");

      console.log("amountBN ", amountBN);

      const randomHash = await contract.methods
        .getWithdrawHash(address, amountBN, timestampInMilliseconds)
        .call();

      // console.log(randomHash,"xx")

      const vrsSign = await processWithdrawal(address, randomHash, amount);

      return res.status(200).json({
        success: true,
        message: "Member Income Withdrawal Request Processed Successfully",
        vrsSign,
        deadline: timestampInMilliseconds,
      });
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("Withdrawal error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});



// Admin Api


router.get("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.query;
    const data = await admin_login.findOne({ email, password });
    res.json(data);
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/getAllUser", async (req, res) => {
  try {
    // const token = req.headers['x-api-key'];
    // if (token !== 'mySecretKey123') {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    const users = await registration.find({}, { password: 0, __v: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/UserLavelIncome", async (req, res) => {
  try {
    const { address } = req.query;

    let data;
    if (address) {
      data = await LevelIncome.find({receiver: address });
    } else {
      data = await LevelIncome.find();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/UserUserIncome", async (req, res) => {
  try {
    const { address } = req.query;

    let data;
    if (address) {
      data = await UserIncome.find({receiver: address });
    } else {
      data = await UserIncome.find();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/UserReEntry", async (req, res) => {
  try {
    const { address } = req.query;

    let data;
    if (address) {
      data = await reEntry.find({user: address });
    } else {
      data = await reEntry.find();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/UserWithdraw", async (req, res) => {
  try {
    const { address } = req.query;

    let data;
    if (address) {
      data = await MemberIncome.find({user: address });
    } else {
      data = await MemberIncome.find();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/UserWithdrawss", async (req, res) => {
  try {
    const { address } = req.query;

    let data;
    if (address) {
      data = await WithdrawalModel.find({user: address });
    } else {
      data = await WithdrawalModel.find();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




// New Plan hyperloop


router.get("/hyperloop", async (req, res) => {
  const { address } = req.query;
  try {
    const data = await registration.findOne({user: address});
    if (!data) {
      return res.status(404).json({ msg: "User not found", success: false });
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})


router.get("/upline",async (req,res)=>{
  const { address } = req.query;

  try {
    // Step 1: Get the latest level 1 document
    const latestLevel1 = await GlobalUplineIncome.findOne({ sender: address, level: 1 })
      .sort({ createdAt: -1 });

    if (!latestLevel1) {
      return res.status(404).json({ msg: "No level 1 data found", success: false });
    }

    // Step 2: Get all documents with createdAt >= latest level 1's createdAt
    const data = await GlobalUplineIncome.find({
      sender: address,
      createdAt: { $gte: latestLevel1.createdAt }
    }).sort({ createdAt: -1 });

    if (!data || data.length === 0) {
      return res.status(404).json({ msg: "Data not found", success: false });
    }

    res.status(200).json({ msg: "Data fetch successful", success: true, data : data.reverse() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error in data fetching", success: false, error: error.message });
  }
});

router.get("/downline", async (req, res) => {
  const { address } = req.query;

  try {
    // Step 1: Get the latest level 1 document
    const latestLevel1 = await GlobalDownlineIncome.findOne({ sender: address, level: 1 })
      .sort({ createdAt: -1 });

    if (!latestLevel1) {
      return res.status(404).json({ msg: "No level 1 data found", success: false });
    }

    // Step 2: Get all documents with createdAt >= latest level 1's createdAt
    const data = await GlobalDownlineIncome.find({
      sender: address,
      createdAt: { $gte: latestLevel1.createdAt }
    }).sort({ createdAt: -1 });

    if (!data || data.length === 0) {
      return res.status(404).json({ msg: "Data not found", success: false });
    }

    res.status(200).json({ msg: "Data fetch successful", success: true, data : data.reverse() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error in data fetching", success: false, error: error.message });
  }
});

router.get("/totalUpline", async (req, res) => {
  const {address} = req.query;
  try {
    const data = await GlobalUplineIncome.find({sender: address});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})

router.get("/totalDownline", async (req, res) => {
  const {address} = req.query;
  try {
    const data = await GlobalDownlineIncome.find({sender: address});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})


router.get("/hyperLoopLevelIncome",async (req,res)=>{
  const {address, level} = req.query;
  try {
    const data = await LevelIncome.find({receiver: address, level: level}).sort({createdAt: -1});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    const amountData = await LevelIncome.find({receiver: address});
    let amount = amountData.reduce((acc, record) => acc + record.reward, 0)/1e18;
    // console.log(amount, "amount")
    res.status(200).json({msg: "Data fetch successful", success: true, data, amount});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})
router.get("/withdrawHyperFlow", async (req,res)=>{
  const {address} = req.query;
  try {
    const data = await WithdrawalModel.find({user: address}).sort({createdAt: -1});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})


// New Plan autopool

router.get("/joinedAutopool",async (req,res)=>{
  const {address} = req.query;
  try {
    const data = await JoinAutoPool.findOne({user: address});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})

router.get("/newUserPlaceAutoPool", async (req,res)=>{
  const {address, level} = req.query;
  try {
    const data = await newuserplace.find({referrer: address, level: level}).sort({createdAt: 1});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})

router.get("/autoPoolUserIncome", async (req,res)=>{
  const {address, level} = req.query;
  try {
    const data = await UserIncome.find({receiver: address, level: level}).sort({createdAt: -1});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    const amountData = await UserIncome.find({receiver: address});
    let amount = amountData.reduce((acc, record) => acc + record.amount, 0)/1e18;
    // console.log(amount, "amount")
    res.status(200).json({msg: "Data fetch successful", success: true, data, amount});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})

router.get("/withdrawAutoPool", async (req,res)=>{
  const {address} = req.query;
  try {
    const data = await WithdrawPool.find({user: address}).sort({createdAt: -1});
    if(!data){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json({msg: "Data fetch successful", success: true, data});
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})


// admin of hyperloop and autopool

router.get("/getAllUserAutoPool", async (req, res) => {
  try {
    const users = await JoinAutoPool.find().sort({createdAt: -1})
    if(!users){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json(users);
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})



router.get("/getAllUserHyperLoop", async (req, res) => {
  try {
    const users = await registration.find().sort({createdAt: -1})
    if(!users){
      return res.status(404).json({msg: "Data not found", success: false});
    }
    res.status(200).json(users);
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: "Error in data fetching", success: false, error: error.message});
  }
})


module.exports = router;
