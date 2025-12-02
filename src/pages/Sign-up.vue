<template>
  <div class="sign-up-page h-screen w-screen flex items-center bg-white justify-center">
    <div class="sign-up-box p-8 bg-white w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form @submit.prevent="handleSignUp">
        <div class="mb-4">
          <label for="username">Username</label>
          <input v-model="username" name="username" type="text" required class="w-full px-3 py-2 border rounded" />
        </div>
        <div class="mb-4">
          <label for="phone">Phone</label>
          <input v-model="phone" name="phone" type="tel" required class="w-full px-3 py-2 border rounded" />
        </div>
        <div class="mb-6">
          <label for="password">Password</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Sign Up
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import router from "@/router/router.js";
import API from "@/api.js";

export default {
  name: "SignUp",
  data() {
    return {
      username: "",
      phone: "",
      password: "",
    };
  },
  methods: {
    async handleSignUp() {
      try {
        const res = await API.post("/register", {
          username: this.username,
          phone: this.phone,
          password: this.password,
        });

        alert(res.msg || "Registration successful!");
        if(res.success == true || 1){  
          router.push("/"); // go to Sign-in page
        }
      } catch (err) {
        if (err.response && err.response.data) {
          alert(JSON.stringify(err.response.data.errors || err.response.data.msg));
        } else {
          alert("Registration failed");
        }
      }
    },
  },
  mounted() {
  },
};
</script>

<style scoped>
.sign-up-box {
  max-width: 100%;
}
</style>
