const express = require('express');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const { PythonShell } = require('python-shell');
const FacultyLogin = mongoose.model('Facultylogin');
const Studentlogin = mongoose.model('Studentlogin');
const Question = mongoose.model('Question');
const Class = mongoose.model('Class');
const Students = mongoose.model('Student')
const Answer = mongoose.model('Answer')
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { exec, execFile } = require('child_process');
const fs = require('fs');
const path = require('path')
const app = express();
const execa  = require('execa')




var compiler = require('compilex');
var options = {stats : true}; //prints stats on console 
compiler.init(options);



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser());





console.log(process.env.PORT);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));
  
router.post('/Studentcreate',async (req,res) => {
    const { rollno,StudentName,email,password } = req.body;
    Studentlogin.findOne({$or:[{rollno:rollno}]}).then((user) => {
        if(user){
            return res.status(200).json({error:"Student already exist"});
        }
        bcrypt.hash(password,12).then(hasedpassword => {
            const Signins = new Studentlogin({
                rollno,
                StudentName,
                email,
                password:hasedpassword,
            });
            Signins.save().then((user) => {res.status(200).json({ successfully:"successfull created account" })})
        })
    });
});


router.post('/facultylogin', async (req,res) => {
    const { username,password } = req.body;
    // req.session.username = username;
    // const cok = req.session.username;
    // res.json({ username:cok })
    const Dates = new Date();
    console.log(Dates);
  const doc = await FacultyLogin.findOneAndUpdate({username:username},{lastlogin:Dates}).then((user) => {
        if(!user){
            return res.status(422).json({ error:"you dont have a account please reach admin" })
        }
        bcrypt.compare(password,user.password).then(data => {
            if(data){
                return res.status(200).json({ success:"Faculty login successfully" })
            }
            else{
                return res.status(422).json({ error:"Invalid password" });
            }
        })
    });
});
router.get('/get-cookie',(req,res) => {
    const cookievalue = req.session.username;
    return res.json({ username:cookievalue });
})

router.delete('/classdel/:id',(req,res) => {
    const { id } = req.params;
    console.log(id);
    // 
    Class.deleteOne({ id:id }).then(rem => {
        return res.status(200).json(rem);
    })
});

router.post('/addfaculty',(req,res) => {
    const { username,email,password } = req.body;
    console.log(username);
    FacultyLogin.findOne({ email:email }).then((user) => {
        if(user){
            return res.status(422).json({ error:"Faculty already there" });
        }
        else{
            bcrypt.hash(password,10).then((hasedpassword) => {
                const FacultyLogins = new FacultyLogin({
                    username,
                    email,
                    password:hasedpassword
                });
                FacultyLogins.save().then((resp) => {
                    return res.status(200).json({ success:"Faculty added successfully" })
                })
            });
        }
    })
});




router.get('/faculty',(req,res) => {
     FacultyLogin.findOne().sort({ lastlogin: 'desc' }).then(check => {
        if(check){
            return res.status(200).json(check);
        }
     })
});
router.get('/studentsfind',(req,res) => {
     Studentlogin.findOne().sort({ lastlogin: 'desc' }).then(check => {
        if(check){
            return res.status(200).json(check);
        }
     })
});


// router.post('/Studentlogin',(req,res) => {
//     const{ username,password } = req.body;
//     Studentlogin.findOne({ username:username }).then((user) => {
//         if(user){
//             bcrypt.compare(password,user.password).then((resp) => {
//                 if(resp){
//                     console.log(resp);
//                     return res.status(200).json({ success:"Faculty login successfully" })
//                 }
//                 else{
//                     return res.status(422).json({ error:"Password invalid" });
//                 }
//             });
//         }
//         else{
//             return res.status(422).json({ error:"you dont have a account please reach admin" })
//         }
//     });
// });



// router.post('/compiled',(req,res) => {
//     const { code,language } = req.body;
//     switch (language) {
//         case 'java':
//           command = `javac Main.java && java Main`;
//           extension = 'java';
//           break;
//         case 'c':
//           command = `gcc Main.c -o Main && ./Main`;
//           extension = 'c';
//           break;
//         case 'cpp':
//           command = `g++ Main.cpp -o Main && ./Main`;
//           extension = 'cpp';
//           break;
//         case 'python':
//           command = `python Main.py`;
//           extension = 'py';
//           break;
//         default:
//           return res.status(400).json({ error: 'Invalid language' });
//       }
//       const filename = `code.${extension}`;
//       const codeFilePath = `./code/${filename}`
//       fs.writeFileSync(path.join(__dirname,codeFilePath), code,(err) => {
//         if(err){
//             throw err;
//         }
//         console.log('Write complete');
//       })
//       var envData = { OS : "windows" , cmd : "g++"};
//       const input = 10;
//     //   compiler.compileCPPWithInput(envData , code , input , function (data) {
//     // 	console.log(data)
//     // });
//      compiler.compileCPP( envData , code , function(data){
//         return res.send(data);
//     });
// });

router.post('/python',async (req,res) => {
    const { code,input } = req.body;
    var envData = { OS : "windows" , cmd : "g++"};
    
    fs.writeFileSync(path.join(__dirname,'./code/code.py'), code,(err) => {
        if(err){
            throw err;
        }
        console.log('Write complete');
      })
      
      try {
        const { stdout:programOutput } = await execa('python',[path.join(__dirname,'./code/code.py')],{
            input:input
        })
        console.log('Compilation successful!');
        console.log('Program output:');
        console.log(programOutput);
        var Output = programOutput
      } catch (error) {
        console.error('Error occurred:');
        console.error(error.stderr);
        // Error.captureStackTrace(error);
        return  res.json({error:error})
         
      }
    return res.status(200).json({output:"Comiled successfull",result:Output});
});

router.post('/c',async (req,res) => {
    const { code,input } = req.body;
    //console.log({code,input});
    var envData = { OS : "windows" , cmd : "g++"};
    
    fs.writeFileSync(path.join(__dirname,'./code/code.c'), code,(err) => {
        if(err){
            throw err;
        }
        console.log('Write complete');
      })
      
      try {
        const { stdout } = await execa('gcc',[path.join(__dirname,'./code/code.c'),'-o','output'])
        console.log('Compilation successful!');
    
        const { stdout: programOutput } = await execa('./output',{
            input:input
        });
        console.log('Program output:');
        console.log(programOutput);
        var Output = programOutput
      } catch (error) {
        console.error('Error occurred:');
        console.error(error.stderr);
        // Error.captureStackTrace(error);
        return  res.json({error:error})
         
      }
    return res.status(200).json({output:"Comiled successfull",result:Output});
});


router.post('/cpp',async (req,res) => {
    const { code,input } = req.body;
   // console.log(code);

    fs.writeFileSync(path.join(__dirname,'./code/code.c++'), code,(err) => {
        if(err){
            throw err;
        }
        console.log('Write complete');
      })
      
      try {
        const { stdout } = await execa('g++',[path.join(__dirname,'./code/code.c++'),'-o','output'])
        console.log('Compilation successful!');
    
        const { stdout: programOutput } = await execa('./output',{
            input:input
        });
        console.log('Program output:');
        console.log(programOutput);
        var Output = programOutput
      } catch (error) {
        console.error('Error occurred:');
        console.error(error.stderr);
        // Error.captureStackTrace(error);
        return  res.json({error:error})

      }
    return res.status(200).json({output:"Comiled successfull",result:Output});
});


router.post('/java',async (req,res) => {
    const { code } = req.body;
    console.log(code);

    // fs.writeFileSync(path.join(__dirname,'./code/code.java'), code,(err) => {
    //     if(err){
    //         throw err;
    //     }
    //     console.log('Write complete');
    //   })
      
    //   try {
    //     const { stdout } = await execa('javac',[path.join(__dirname,'./code/code.java')])
    //     console.log('Compilation successful!');
    
    //     const { stdout: programOutput } = await execa('java',['-cp','./code','code']);
    //     console.log('Program output:');
    //     console.log(programOutput);
    //     var Output = programOutput
    //   } catch (error) {
    //     console.error('Error occurred:');
    //     console.error(error);
    //   }
    // return res.status(200).json({output:"Comiled successfull",result:Output});
    const { exec } = require('child_process');

function runJavaProgram() {
  const javaFilePath = path.join(__dirname,'./code/code.java');

  exec(`javac ${javaFilePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Compilation error:');
      console.error(stderr);
    } else {
      console.log('Compilation successful!');
      exec(`java -classpath path/to/your/java YourClass`, (error, stdout, stderr) => {
        if (error) {
          console.error('Execution error:');
          console.error(stderr);
        } else {
          console.log('Program output:');
          console.log(stdout);
        }
      });
    }
  });
}
runJavaProgram();
});


router.post('/questions',(req,res) => {
    const { classid,createdby,problem,subject,SampleInputOne,SampleInputTwo,SampleOutputOne,SampleOutputTwo} = req.body;
    // console.log(problem)
    // console.log(subject)
    // console.log(SampleInputOne)
    // console.log(SampleInputTwo)
    // console.log(SampleOutputTwo)
    // console.log(SampleOutputOne)
    // console.log(TestCaseOne)
    // console.log(TestCaseTwo)
    // console.log(TestCaseThree)
    if( problem == "" || SampleInputOne =="" || SampleInputTwo =="" || SampleOutputOne =="" || SampleOutputTwo == "" ){
        return res.status(442).json({error:"please fill all the data"})
    }
    else{
        const Ques = new Question({
            classid,
            facultyid:createdby,
            subject,
            problem,
            SampleInputOne,
            SampleInputTwo,
            SampleOutputOne,
            SampleOutputTwo,
        });
        Ques.save().then((data) => {
           return res.status(200).json({ success:"success" });
        })
    }
});

router.post('/getques',async (req,res) => {
    const { rollno } = req.body;
    Students.find({rollno:rollno}).then(async user => {
    //     let que = user;
    //     console.log(user)
        const data = await getque(user);
        data.map(getques => {
            
        Question.find({classid:getques}).then(ques => {
            return res.status(200).json(ques);
        });
         console.log(data);
        })
    console.log(user)
    });
})

const getque = (user) => {
    let arr = new Array()
    user.map(users => {
        
        var data = users.classid;
        //var data = 10;
        console.log(data);
        arr.push(users.classid);
        //return data
    })
    return arr;
}

router.post('/answer',(req,res) => {
    const { Lang,code,userid,input,solve } = req.body;
    const record = userid+solve;
    console.log({Lang,code,userid,input,solve,record})
    Answer.findOne({record:record}).then(user => {
        console.log(!user)
        if(!user){
            const Ans = new Answer({
                record,
                queid:solve,
                code,
                input,
                Lang,
                rollno:userid
            });
            Ans.save().then(data => {
                return res.status(200).json({Answer:"Submitted"})
            })
        }
        else{
            return res.json({Answer:"Already Submitted"})
        }
    })
})

 router.post('/addstudent',(req,res) => {
    const  { classid,createdby,rollno, Studentname } =req.body; 
    const facultyid = createdby+rollno;
    let regex = /^[0-9]*$/;
    Students.findOne({$and:[{id:facultyid}],$or:[{rollno:rollno},{Studentname:Studentname}]}).then((student) => {
        if(student){
            return res.status(200).json({ error:"student already exist for you" });
        }
        if(!regex.test(rollno)){
            return res.status(422).json({ error:"please enter the rollno.." })
        }
        else{
                const Student = new Students({
                    id:facultyid,
                    classid,
                    createdby,
                    rollno,
                    Studentname,
                })
                Student.save().then((resp) => {
                    return res.status(200).json({ success:"student added successfull" });
                }
            )
        }
    });
});

router.post ('/Studentlogin', (req,res) => {
    const { rollno,password } = req.body;
    const Dates = new Date();
    Studentlogin.findOneAndUpdate({rollno:rollno},{lastlogin:Dates}).then((user) => {
        if(!user){
            return res.status(442).json({ error:"there is no user" });
        }
        bcrypt.compare(password,user.password).then(data => {
            if(data){
                return res.status(200).json({ successfully:"successfully login" });
            }
            else{
                return res.status(422).json({ error:"Invalid password" });
            }
        })
    });
});
router.post('/createclass',async (req,res) => {
    try{
        const  { facultyid,className,batch, subject } = req.body;
        const facultypass = facultyid+className.toLowerCase()+batch;
        console.log(facultypass); 
        Class.findOne({ id:facultypass }).then((user) => {
            console.log(user);
            if(!user){
                const classes = new Class({
                    id:facultypass,
                    facultyid,
                    className,
                    batch,
                    subject
                });
                classes.save().then(okk => {
                    return res.status(200).json({ success:"Class created successfully" });
                })
            }
            else{
                return res.status(422).json({ error: "Class already there for the faculty" })
            }
        })
    }
    catch(err){
        console.error(err);
    }
});


router.get('/getclass/:id',(req,res) => {
     const { id } = req.params;
     console.log(id);
     try{
        Class.find().where({facultyid:id}).then(faculty => {
            console.log(faculty);
            return res.status(200).json(faculty);
        })
     }
     catch(err){
        return res.status(422).json({ error:"you already have this class" })
     }
});


router.get('/getstudent/:id',(req,res) => {
    const { id } = req.params;
    Students.find({}).where({classid:id}).then(students => {
        if(students){
            return res.status(200).json(students);
        }
    });
});


router.delete(`/deletestudent/:id`,(req,res) => {
    const { id } = req.params;
    Students.deleteOne({ id:id }).then(user => {
        if(user) {
            return res.status(200).json({ success:"Student data deleted" });
        }
        else{
            return res.status(422).json({ error:"Student not found" });
        }
    })
});

router.get('/get',(req,res) => {
    Studentlogin.find().then(user => {
        return res.status(200).json(user)
    });
})




module.exports = router;