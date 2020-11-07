<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">Welcome to Vuetify</h1>
        <button v-on:click="greet">Greet</button>
        <p class="subheading font-weight-regular">
          For help and collaboration with other Vuetify developers,
          <br />please join our online
          <a href="https://community.vuetifyjs.com" target="_blank"
            >Discord Community</a
          >
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">What's next?</h2>

        <v-row>
          <!-- <v-text-field :value="decks"></v-text-field> -->
          <v-treeview
            :items="decks"
            open-all
            expand-icon="mdi-chevron-down"
            on-icon="mdi-bookmark"
            off-icon="mdi-bookmark-outline"
            indeterminate-icon="mdi-bookmark-minus"
          ></v-treeview>
        </v-row>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">Important Links</h2>

        <v-row justify="center">
          <a
            v-for="(link, i) in importantLinks"
            :key="i"
            :href="link.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ link.text }}
          </a>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "HelloWorld",

  data: () => ({
    decks: [],
    importantLinks: [
      {
        text: "Documentation",
        href: "https://vuetifyjs.com",
      },
      {
        text: "Chat",
        href: "https://community.vuetifyjs.com",
      },
      {
        text: "Made with Vuetify",
        href: "https://madewithvuejs.com/vuetify",
      },
      {
        text: "Twitter",
        href: "https://twitter.com/vuetifyjs",
      },
      {
        text: "Articles",
        href: "https://medium.com/vuetify",
      },
    ],
  }),
  created: function () {
    // console.log("a is: " + this.a);
  },
  methods: {
    greet: function () {
      var url = "http://localhost:8765";
      var data = {
        action: "deckNamesAndIds",
        version: 6,
      };

      // fetch(url, {
      //   method: "POST", // or 'PUT'
      //   body: {data}, // data can be `string` or {object}!
      //   //body: JSON.stringify(data), // data can be `string` or {object}!
      // })
      //   .then((res) => res.json())
      //   .catch((error) => console.error("Error:", error))
      //   .then((response) => console.log("Success:", response));
      axios
        .post(url, data, {
          headers: {
            "content-type": "text/plain",
          },
        })
        .then((response) => {
          this.decks = this.formatDecks(response.data.result);
          console.log(this.decks);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    formatDecks(data) {
      // todo: check null

      let items = Object.entries(data);
      if (items.length <= 0) return;

      let idNameArray = items.map(([vName, id]) => {
        let names = vName.split("::");
        let name = names[names.length - 1];
        return [id, name];
      });

      let nameIdMap = new Map(items);
      let idNameMap = new Map(idNameArray);
      let treeRootMap = new Map();
      items.forEach(([verboseName]) => {
        let temp, vName;
        let names = verboseName.split("::");
        names.forEach((name, i) => {
          let id;
          if (i === 0) {
            vName = name;
            id = nameIdMap.get(vName);
            if (treeRootMap.has(id)) {
              temp = treeRootMap.get(id);
            } else {
              temp = new Map();
              treeRootMap.set(id, temp);
            }
          } else {
            vName = vName + "::" + name;
            id = nameIdMap.get(vName);
            if (temp.has(id)) {
              temp = temp.get(id);
            } else {
              let t = new Map();
              temp.set(id, t);
              temp = t;
            }
          }
        });
      });

      let decks = this.convertMapToArray(treeRootMap, idNameMap);

      // items.forEach((key) => {
      //   let deck;
      //   let names = key.split("::");
      //   for (let i = names.length - 1; i >= 0; i--) {
      //     if (deck) {
      //       deck = { name: names[i], children: [deck] };
      //     } else {
      //       deck = { id: data[key], name: names[i] };
      //     }
      //   }
      //   // for (let i = 0, n = names.length - 1; i <= n; i++) {
      //   //   const name = names[i];
      //   //   if (deck?.[name]) {
      //   //     if (i === n) {
      //   //       deck.id = data[key];
      //   //     }
      //   //   } else {

      //   //   }
      //   // }
      //   decks.push(deck);
      // });
      return decks;
    },
    convertMapToArray(map, idNameMap) {
      let decks = [];
      map.forEach((childMap, id) => {
        let deck = { id: id, name: idNameMap.get(id) };
        if (childMap.size > 0) {
          deck.children = this.convertMapToArray(childMap, idNameMap);
        }
        decks.push(deck);
      });
      return decks;
    },
  },
};
</script>
