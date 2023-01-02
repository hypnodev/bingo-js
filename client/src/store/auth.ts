import {defineStore} from "pinia";
import {computed, Ref, ref} from "vue";
import {User} from "../../../src/user/entities/user.entity";

export const useAuth = defineStore('auth', () => {
    const user: Ref<User | null> = ref(null);

    const logged = computed(() => user.value !== null);

    function setUser(newUser: User | null) {
        user.value = newUser;
    }

    return { user, logged, setUser };
})
