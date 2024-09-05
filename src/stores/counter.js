import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCounterStore = defineStore(
  "counter",
  () => {
    const theme = ref("dark");

    const CONFIG = ref({
      horas_por_dia: "",
      intervalos: [
        {
          id: "01",
          entrada: "",
          entradaTime: 0,
          saida: "",
          saidaTime: 0,
          total_intervalo: 0,
          formatedEntrada: null,
          formatedSaida: null,
        },
        {
          id: "02",
          entrada: "",
          entradaTime: 0,
          saida: "",
          saidaTime: 0,
          total_intervalo: 0,
          formatedEntrada: null,
          formatedSaida: null,
        },
      ],
    });

    const horas_por_dia = ref("");

    return { theme, CONFIG, horas_por_dia };
  },
  { persist: true }
);
