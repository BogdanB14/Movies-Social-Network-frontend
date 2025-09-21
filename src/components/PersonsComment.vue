<template>
  <article class="comment">
    <div class="avatar" :title="author">
      {{ initials }}
    </div>
    <div class="comment-body">
      <div class="comment-meta">
        <span class="author">@{{ author }}</span>
        <span class="sep">•</span>
        <span class="movie">{{ movie }}</span>
        <span class="sep">•</span>
        <span class="time">{{ timeAgo }}</span>
        <button v-if="canDelete" class="delete-btn" :disabled="deleting" @click="deleteComment">
          ×
        </button>
      </div>
      <p class="comment-text">{{ content }}</p>
    </div>
  </article>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";

export default {
  name: "PersonsComment",
  props: {
    id: { type: Number, required: true },
    author: { type: String, required: true },
    movie: { type: String, required: true },
    time: { type: String, required: true },
    content: { type: String, required: true },
  },
  setup(props, { emit }) {
    const auth = useAuthStore();
    const deleting = ref(false);
    const canDelete = computed(
      () => auth.isLoggedIn && (auth.role === "admin" || auth.role === "moderator")
    );
    const deleteComment = async () => {
      if (!props.id) {
        window.alert("Nedostaje ID komentara.");
        return;
      }

      if (!window.confirm("Obrisati komentar?")) return;

      deleting.value = true;
      try {
        emit("deleted", props.id);
      } finally {
        deleting.value = false;
      }
    };
    return { canDelete, deleteComment, deleting };
  },
  computed: {
    initials() {
      if (!this.author) return "?";
      const parts = this.author.replace(/[_.-]/g, " ").split(" ");
      return (
        (parts[0][0] || "").toUpperCase() +
        (parts[1] ? (parts[1][0] || "").toUpperCase() : "")
      );
    },
    timeAgo() {
      const t = new Date(this.time);
      if (isNaN(t)) return this.time;
      const now = new Date();
      const secs = Math.floor((now - t) / 1000);
      if (secs < 60) return `${secs}s`;
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      const days = Math.floor(hrs / 24);
      if (days < 30) return `${days}d`;
      return t.toLocaleDateString();
    },
  },
};
</script>
<style scoped>
.comment {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem;
  background: #141414;
  border: 1px solid #222;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}
.avatar {
  min-width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2b2b2b, #383838);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e6e6e6;
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid #333;
}
.comment-body {
  flex: 1;
}
.comment-meta {
  font-size: 0.85rem;
  color: #cfcfcf;
  margin-bottom: 0.4rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.author {
  font-weight: 600;
  color: #ffffff;
}
.movie {
  color: #a8d08a;
  font-weight: 600;
}
.sep {
  color: #666;
}
.time {
  color: #8f8f8f;
  font-size: 0.8rem;
}
.comment-text {
  margin: 0;
  color: #ddd;
  line-height: 1.4;
}
.delete-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s, transform 0.1s;
}
.delete-btn:hover {
  color: #ff1f1f;
  transform: scale(1.15);
}
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>