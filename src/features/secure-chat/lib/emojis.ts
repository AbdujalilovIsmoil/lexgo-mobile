const list = (s: string) => s.split(" ");

// A small built-in emoji picker (the system emoji keyboard works too): [category icon, emoji list].
export const EMOJI: { icon: string; items: string[] }[] = [
  { icon: "😀", items: list("😀 😃 😄 😁 😆 😅 😂 🤣 🙂 😉 😊 😇 🥰 😍 🤩 😘 😗 😋 😛 😜 🤪 😎 🤓 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 😴 😌 😢 😭 😤 😠 😡 🤯 😳 🥺 😱 😨 😰 😓 🤗") },
  { icon: "👍", items: list("👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🖐 👋 🙌 👏 🙏 💪 🫡 🫶 ✍️ 🤲 👐 🤌 🤝") },
  { icon: "❤️", items: list("❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 ✨ 🔥 💯 ⭐ 🌟 💥 🎉 🎊 🎁 🏆 🥇") },
  { icon: "⚖️", items: list("⚖️ 📄 📑 📋 📎 📌 🗂 📁 📝 ✏️ 🖊 📅 🗓 ⏰ ⏳ ✅ ☑️ ❌ ⚠️ ❓ ❗ 🔒 🔑 📞 📱 💼 🏛 🏢 💳 💰 🧾") },
  { icon: "🌿", items: list("🌿 🌸 🌼 🌞 🌙 ☀️ ⛅ 🌧 ❄️ 💧 🌍 🏔 🌲 🍀 🐶 🐱 🦁 🐼 🦋 🍎 🍊 🍋 🍉 🍇 ☕ 🍵 🍕 🍔") },
];
