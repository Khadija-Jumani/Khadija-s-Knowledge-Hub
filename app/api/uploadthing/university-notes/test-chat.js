fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hello, are you working?' }] })
})
    .then(res => {
        console.log('Status:', res.status);
        return res.text();
    })
    .then(text => console.log('Response:', text))
    .catch(err => console.error('Error:', err));
