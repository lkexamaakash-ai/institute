const {markLectureAttendance} = require('./attendance.service')

const markAttendance = async(req,res) =>{
    try{

        const {lectureId, actualStartTime,actualEndTime,payout,status} = req.body;

        const record = await markLectureAttendance({
            lectureId: Number(lectureId),
            actualStartTime: new Date(actualStartTime),
            actualEndTime: new Date(actualEndTime),
            status:status,
            payout:Number(payout)
        })

        res.json({
            success:true,
            message:"Lecture attendance marked",
            data:record
        })
    }catch(error){
        res.status(400).json({
            message:error.message
        })
    }
}

module.exports = {
    markAttendance
}