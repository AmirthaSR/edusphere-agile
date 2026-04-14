module.exports = async function (context, req) {

  // Hardcoded for now — later you can fetch from a DB
  const courses = [
    {
      id: 1,
      name: "Data Structures & Algorithms",
      icon: "🧮",
      bg: "#1e3a5f",
      progress: 72,
      lessons: "18/25 lessons"
    },
    {
      id: 2,
      name: "Web Development Fundamentals",
      icon: "🌐",
      bg: "#1a3d2e",
      progress: 91,
      lessons: "22/24 lessons"
    },
    {
      id: 3,
      name: "Machine Learning Basics",
      icon: "🤖",
      bg: "#3b2a1a",
      progress: 40,
      lessons: "8/20 lessons"
    },
    {
      id: 4,
      name: "Cloud Computing with Azure",
      icon: "☁️",
      bg: "#1e2b4a",
      progress: 58,
      lessons: "12/21 lessons"
    },
    {
      id: 5,
      name: "Database Management",
      icon: "🗄️",
      bg: "#2a1e3d",
      progress: 85,
      lessons: "17/20 lessons"
    }
  ];

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: { courses }
  };
};