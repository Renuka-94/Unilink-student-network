const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const Event = require('./models/Event');
const Group = require('./models/Group');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Post.deleteMany({}),
      Event.deleteMany({}), Group.deleteMany({})
    ]);
    console.log('Cleared existing data...');

    // Create admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@unilink.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      bio: 'Platform administrator',
      isActive: true
    });

    // Create sample students
    const students = await User.create([
      { name: 'Rahul Sharma', email: 'rahul@unilink.com', password: 'password123', department: 'Computer Science', year: '2nd Year', skills: ['JavaScript', 'React', 'Python', 'Machine Learning'], interests: ['Coding', 'Hackathons', 'AI'], bio: '2nd year CS student passionate about AI and web development. Looking to collaborate on cool projects!', achievements: ['Won State Hackathon 2023', 'Google Developer Student Club Member'] },
      { name: 'Priya Patel', email: 'priya@unilink.com', password: 'password123', department: 'Information Technology', year: '3rd Year', skills: ['UI/UX Design', 'Figma', 'HTML/CSS', 'Photography'], interests: ['Design', 'Photography', 'Entrepreneurship'], bio: 'IT student with a passion for design and user experience. Creating beautiful digital experiences.' },
      { name: 'Arjun Reddy', email: 'arjun@unilink.com', password: 'password123', department: 'Electronics', year: '3rd Year', skills: ['Arduino', 'Python', 'IoT', 'Circuit Design'], interests: ['Electronics', 'Robotics', 'Coding'], bio: 'Electronics engineer-in-making. Building smart IoT solutions for real-world problems.' },
      { name: 'Sneha Kulkarni', email: 'sneha@unilink.com', password: 'password123', department: 'MBA', year: '1st Year', skills: ['Business Strategy', 'Marketing', 'Data Analysis', 'Leadership'], interests: ['Entrepreneurship', 'Marketing', 'Sports'], bio: 'MBA student focused on entrepreneurship and business innovation. Let\'s build something amazing!' },
      { name: 'Vikram Singh', email: 'vikram@unilink.com', password: 'password123', department: 'Mechanical', year: '4th Year', skills: ['AutoCAD', 'SolidWorks', 'Python', '3D Printing'], interests: ['Engineering', 'Sports', 'Robotics'], bio: 'Final year Mech student. Into robotics and sustainable engineering solutions.' },
    ]);

    // Connect some students
    students[0].connections.push(students[1]._id, students[2]._id);
    students[1].connections.push(students[0]._id, students[3]._id);
    students[2].connections.push(students[0]._id);
    await Promise.all(students.map(s => s.save()));

    // Create sample posts
    await Post.create([
      { user: students[0]._id, content: 'Just completed my first Machine Learning model that predicts student performance! Built using Python and scikit-learn. Achieved 89% accuracy on the test dataset. 🚀 Anyone interested in collaborating on AI projects?', tags: ['MachineLearning', 'Python', 'AI'], likes: [students[1]._id, students[2]._id] },
      { user: students[1]._id, content: 'Super excited to share my latest UI/UX redesign project for our college library app! 📱 Focus on accessibility and clean design. Check out the Figma prototype link in comments! #UIDesign #UXResearch', tags: ['UIDesign', 'Figma', 'CollegeApp'], likes: [students[0]._id, students[3]._id, students[4]._id] },
      { user: students[2]._id, content: 'Our IoT project team is looking for 2 more members! We\'re building a smart campus parking system using Raspberry Pi and sensors. Requirements: Basic Python knowledge, enthusiasm to learn! DM me if interested 🤖', tags: ['IoT', 'Raspberry Pi', 'SmartCampus', 'TeamLookup'] },
      { user: students[3]._id, content: 'Excited to announce that our startup idea "EduBridge" made it to the top 10 at the State Level Business Plan Competition! 🏆 Grateful for the mentorship and support from our college. Keep hustling!', tags: ['Startup', 'Entrepreneurship', 'Achievement'], likes: [students[0]._id, students[1]._id] },
      { user: students[4]._id, content: 'Just discovered an amazing open source project for 3D visualization. Contributing to it now as part of my final year project. The open source community is truly inspiring! Anyone else contributing to open source? 💻', tags: ['OpenSource', 'Programming', 'FinalYear'] },
      { user: adminUser._id, content: '📢 Announcement: UniLink is now live for all students! Create your profile, connect with peers, join groups, and stay updated about campus events. Welcome to your university\'s digital community! 🎓', tags: ['Announcement', 'UniLink', 'Welcome'] },
    ]);

    // Create sample events
    const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await Event.create([
      { title: 'Campus Hackathon 2024', description: 'A 24-hour coding marathon where teams build innovative solutions for real-world problems. Prizes worth ₹50,000! Open to all streams.', date: futureDate(15), location: 'Main Auditorium, Block A', category: 'hackathon', organizer: adminUser._id, maxCapacity: 200, isApproved: true, registeredStudents: [students[0]._id, students[2]._id], tags: ['hackathon', 'coding', 'prize'] },
      { title: 'React.js Workshop for Beginners', description: 'Learn the fundamentals of React.js from scratch. Hands-on coding sessions, real project building. Laptops required. Certificate provided!', date: futureDate(7), location: 'Computer Lab 3, Tech Block', category: 'workshop', organizer: students[0]._id, maxCapacity: 40, isApproved: true, registeredStudents: [students[1]._id], tags: ['react', 'web', 'javascript'] },
      { title: 'Annual Cultural Fest - TechNova 2024', description: 'Our college\'s biggest cultural and technical fest! Music, dance, coding competitions, gaming tournaments, food stalls, and so much more!', date: futureDate(30), location: 'College Campus Grounds', category: 'cultural', organizer: adminUser._id, maxCapacity: 2000, isApproved: true, tags: ['cultural', 'fest', 'music'] },
      { title: 'AI & Future of Work Seminar', description: 'Industry experts discuss how AI is reshaping careers and what skills students need for the future job market.', date: futureDate(20), location: 'Seminar Hall 2', category: 'seminar', organizer: adminUser._id, maxCapacity: 150, isApproved: true, registeredStudents: [students[3]._id] },
      { title: 'Inter-College Cricket Tournament', description: 'Annual cricket tournament. Teams of 11 players. Register your team and compete for the trophy!', date: futureDate(10), location: 'College Cricket Ground', category: 'sports', organizer: students[4]._id, maxCapacity: 120, isApproved: true },
      { title: 'Campus Placement Drive - TechCorp India', description: 'TechCorp India will be conducting campus placements for Software Engineer roles. Package: ₹8-12 LPA. Eligibility: B.Tech CS/IT, 7+ CGPA.', date: futureDate(5), location: 'Placement Cell, Admin Block', category: 'placement', organizer: adminUser._id, maxCapacity: 100, isApproved: true, registeredStudents: [students[0]._id] },
    ]);

    // Create sample groups
    await Group.create([
      { name: 'Coding Club', description: 'For students passionate about programming, competitive coding, and software development. Weekly coding challenges and hackathon prep!', category: 'coding', creator: students[0]._id, members: [students[0]._id, students[1]._id, students[2]._id], posts: [{ user: students[0]._id, content: 'This week\'s challenge: Build a todo app in under 1 hour! Share your GitHub links 🚀', createdAt: new Date() }] },
      { name: 'Design Society', description: 'A community for UI/UX designers, graphic artists, and creative minds. Share your work, get feedback, and grow together!', category: 'design', creator: students[1]._id, members: [students[1]._id, students[3]._id], posts: [{ user: students[1]._id, content: 'Weekly design prompt: Design an app for campus food ordering. Share your wireframes!', createdAt: new Date() }] },
      { name: 'Entrepreneurship Cell', description: 'Connect with fellow student entrepreneurs. Business plan workshops, investor meetups, startup pitch sessions and mentoring.', category: 'entrepreneurship', creator: students[3]._id, members: [students[3]._id, students[0]._id], posts: [] },
      { name: 'Photography Club', description: 'Capture the world through your lens! Events, photowalks, editing workshops, and showcasing student photography.', category: 'photography', creator: students[1]._id, members: [students[1]._id, students[4]._id] },
      { name: 'Sports & Fitness', description: 'Stay active, stay fit! Cricket, football, badminton teams. Morning runs, fitness tips, and sports event updates.', category: 'sports', creator: students[4]._id, members: [students[4]._id, students[2]._id] },
    ]);

    console.log('\n✅ Seed data created successfully!\n');
    console.log('📧 Admin login: admin@unilink.com / admin123');
    console.log('📧 Student login: rahul@unilink.com / password123');
    console.log('📧 Student login: priya@unilink.com / password123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
