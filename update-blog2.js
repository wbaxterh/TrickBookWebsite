const axios = require('axios');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2M1ZmQzNWE4NmM4NGUzNDc3N2YxNGEiLCJuYW1lIjoiV2VzbGV5IEh1YmVyIiwiZW1haWwiOiJ3ZXNsZXliYXh0ZXJodWJlckBnbWFpbC5jb20iLCJpbWFnZVVyaSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xyQTZkaG9qRmM0ZHd5bmNtQllsMWZhWXhsSTBoWFNjTUVYa1doN2NUMUFCek12a3pqPXM5Ni1jIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY5MDUwMjYyfQ.27It_LOyvmd9pEMEY9qFC2XOHk3KOtxIUyeEMmjCI00';

const htmlContent = `<p><em>By Riders. For Riders.</em></p>

<hr>

<h2>The tools changed. So we built our own platform.</h2>

<p>Here's the thing about 2026: with tools like Claude Code, it's never been easier for <em>anyone</em> to build <em>anything</em>.</p>

<p>You don't need a $50M seed round. You don't need a team of 200 engineers. You don't need permission from Silicon Valley.</p>

<p>You just need a vision and the will to ship.</p>

<p>So we built TrickBook — a social platform for action sports, made by people who actually ride.</p>

<hr>

<h2>Why now?</h2>

<p>Because skaters, snowboarders, surfers, BMXers — we've been posting clips on platforms that don't give a damn about us.</p>

<p>Instagram's algorithm buries your content unless you pay. TikTok is a slot machine designed to hijack your dopamine. Facebook is... well, it's Facebook.</p>

<p><strong>These corporations don't have our best interests at heart.</strong> They have shareholders.</p>

<p>We wanted something different. Something that actually serves the community.</p>

<hr>

<h2>What we built</h2>

<p><strong>A feed that feels like TikTok or Reels</strong> — but for tricks, not thirst traps. Share clips. Get hyped. Discover new riders.</p>

<p><strong>Messaging on the caliber of WhatsApp</strong> — DMs, group chats, crew coordination. Plan sessions without leaving the app.</p>

<p><strong>A map to pin and save spots</strong> — like Google Maps, but for ledges, rails, parks, and secret spots. Share with your crew or keep them lowkey.</p>

<p><strong>Trickipedia</strong> — a living encyclopedia of tricks. Learn the progression. Track what you've landed. See what's next.</p>

<p>All of it. In one place. Built for us.</p>

<hr>

<h2>The real question</h2>

<p>Who do you want to win?</p>

<p><strong>Meta?</strong> A company that makes billions selling your attention to advertisers?</p>

<p>Or a <strong>By Riders, For Riders</strong> platform — built by someone who actually skates, for people who actually ride?</p>

<hr>

<h2>Join the community</h2>

<p><strong>The TrickBook</strong> is live. The social update is here.</p>

<p>This isn't just an app. It's a statement:</p>

<blockquote>We can build our own tools. We don't need their platforms. The community is the product — not you.</blockquote>

<p>See you in the feed. 🛹</p>

<p><strong>#ByRidersForRiders #TheTrickBook #ActionSports</strong></p>`;

async function updatePost() {
  try {
    const _response = await axios.patch(
      'https://api.thetrickbook.com/api/blog/update/6980e0ef50aee3d50c0dd263',
      { content: htmlContent },
      { headers: { 'x-auth-token': token } },
    );
  } catch (_error) {}
}

updatePost();
