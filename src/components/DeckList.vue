<template>
  <v-card>
    <v-toolbar color="primary" dark flat>
      <v-icon>mdi-silverware</v-icon>
      <v-toolbar-title>Local hotspots</v-toolbar-title>
    </v-toolbar>

    <v-row>
      <v-col>
        <v-card-text>
          <v-treeview
            :items="decks"
            selected-color="indigo"
            open-on-click
            selectable
            return-object
            expand-icon="mdi-chevron-down"
            on-icon="mdi-bookmark"
            off-icon="mdi-bookmark-outline"
            indeterminate-icon="mdi-bookmark-minus"
          >
          </v-treeview>
        </v-card-text>
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn text> Reset </v-btn>

      <v-spacer></v-spacer>

      <v-btn class="white--text" color="green darken-1" depressed>
        Save
        <v-icon right> mdi-content-save </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  name: "DeckList",

  data: () => ({
    decks: [],
  }),
  created: function () {
    this.greet();
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
          // this.decks = this.formatDecks(response.data.result);
          this.decks = this.getDecks(response.data.result);
          console.log(this.decks);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getDecks(data) {
      // todo: check null

      let items = Object.entries(data);
      if (items.length <= 0) return;

      const DECKROOT = "deckRoot";
      let parentChildrenMap = new Map();
      let nameObjectMap = new Map();
      items.forEach(([verboseName, id]) => {
        let names = verboseName.split("::");
        let name = names[names.length - 1];

        if (names.length === 1) {
          parentChildrenMap.set(verboseName, DECKROOT);
          nameObjectMap.set(verboseName, { id: id, name: name });
        } else {
          names.length = names.length - 1;
          let parentName = names.join("::");
          parentChildrenMap.set(verboseName, parentName);
          nameObjectMap.set(verboseName, { id: id, name: name });
        }
      });

      let rootDeck = { name: DECKROOT, children: [] };
      parentChildrenMap.forEach((pName, cName) => {
        let parentDeck;
        if (pName === DECKROOT) {
          parentDeck = rootDeck;
        } else {
          parentDeck = nameObjectMap.get(pName);
        }
        let childDeck = nameObjectMap.get(cName);
        parentDeck.children = [...(parentDeck.children || []), childDeck];
      });

      return rootDeck.children;
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
