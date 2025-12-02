<template>
  <div class="sign-in-page h-screen w-screen flex items-center bg-white justify-center">
    <div class="sign-in-box p-2 md:p-8 bg-white w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Sign In</h2>
      <form @submit.prevent="handleSignIn">
        <div class="mb-4">
          <label for="phone">Phone</label>
          <input v-model="phone" type="tel" required class="w-full px-3 py-2 border rounded" />
        </div>
        <div class="mb-6">
          <label for="password">Password</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded" />
        </div>
        <div class="mb-3 flex justify-end">
          <p @click="goSignUp" class="text-blue-500 hover:underline text-sm">Don't have an account? Sign Up</p>
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import API from "@/api";
import { useUserStore } from "@/store/userStore";
import router from "@/router/router.js";

export default {
  name: "SignIn",
  data() {
    return {
      phone: "",
      password: ""
    };
  },
  methods: {
    async handleSignIn() {
      const userStore = useUserStore();
      try {
        const res = await API.post("/login", {
          phone: this.phone,
          password: this.password
        });
        console.log(res.data);
        userStore.setUser(res.data.data); 
        if(res.data.success == true || 1){
          router.push("/"); 
        } else {
          alert(res.data.msg || "Invalid credentials");
        }
      } catch (err) {
        alert("Login failed");
      }
    },
    goSignUp() {
      router.push("/sign-up");
    }
  }
};
</script>

<style scoped>
.sign-in-box {
  max-width: 100%;
}
</style>
