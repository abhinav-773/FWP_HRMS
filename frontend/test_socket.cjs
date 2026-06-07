const { io } = require('socket.io-client');

const SOCKET_URL = 'http://localhost:5000';
const meetingUrl = '4d3e7d16-0a15-4754-b5b3-f8605be687fb'; // Using the known valid meetingUrl from earlier
const interviewId = 'cfff2966-c23f-427f-b194-ea2e5da7a8bf';

console.log('Connecting to', SOCKET_URL);
const socket = io(SOCKET_URL, {
  query: { meetingUrl }
});

socket.on('connect', () => {
  console.log('Connected! Socket ID:', socket.id);
  console.log('Emitting join_interview_room...');
  socket.emit('join_interview_room', meetingUrl);
});

socket.on('interview_ready', (data) => {
  console.log('interview_ready received:', data);
  console.log('Emitting request_next_question...');
  socket.emit('request_next_question', { interviewId });
});

socket.on('ai_question_audio', (data) => {
  console.log('ai_question_audio received:', data);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('Timeout waiting for response');
  socket.disconnect();
  process.exit(1);
}, 5000);
