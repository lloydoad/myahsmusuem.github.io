const BASE_API = 'https://myah-musuem-server.herokuapp.com';
const JOURNAL_API = BASE_API + '/journals';
const WISH_API = BASE_API + '/wishes';
const DELETE_API = BASE_API + '/deleteWish';

var app = new Vue({
    el: "#app",
    data: {
        newPostTitle: "New Journal",
        textFieldData: "",
        pastJournals: [],
        isShowingEntry: false,
        isHidingEntry: true,
        isAddingWishList: false,
        wishList: [],
        quoteOfDay: []
    },
    methods: {
        showJournalEntry: function (event) {
            if(event.srcElement.name === "addJournalButton") {
                this.newPostTitle = "New Journal";
                this.isAddingWishList = false;
            }else if(event.srcElement.name === "addWishList") {
                this.newPostTitle = "New Wish-List";
                this.isAddingWishList = true;
            }

            this.isShowingEntry = true;
            this.isHidingEntry = false;
        },
        hideJournalEntry: function () {
            this.isHidingEntry = true;
            this.isShowingEntry = false;
        },
        updateJournals: function () {
            if(this.textFieldData !== "" && !this.isAddingWishList) {
                const date = new Date();
                const dateString = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear();
                postJournal({
                    entry: this.textFieldData,
                    date: dateString
                });
                reloadJournal();
            } else if (this.textFieldData !== "" && this.isAddingWishList) {
                postWish({
                    item: this.textFieldData,
                    done: false
                });
                reloadWishes();
            }
            this.textFieldData = "";
        },
        deleteCheckedWishes: function () {
            var deleteList = [];
            var keptList = [];
            for(var i = 0; i < this.wishList.length; i++) {
                if(this.wishList[i].done == true) {
                    deleteList.push(this.wishList[i]);
                } else {
                    keptList.push(this.wishList[i]);
                }
            }

            for(var a = 0; a < deleteList.length; a++) {
                deleteWish(deleteList[a]);
            }

            this.wishList = [];
            keptList.forEach(wish => {
                this.wishList.unshift(wish);
            });
        }
    }
});

function postJournal(entry) {
    fetch(JOURNAL_API, {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
            'content-type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(function (returnedEntry) {
        reloadJournal();
    });
}

function postWish(entry) {
    fetch(WISH_API, {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
            'content-type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(function (returnedEntry) {
        reloadWishes();
    });
}

function deleteWish(entry) {
    fetch(DELETE_API, {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
            'content-type': 'application/json'
        }
    })
}

function reloadWishes() {
    fetch(WISH_API)
    .then(response => response.json()
    .then(wishes => {
        app.wishList = [];
        wishes.reverse();
        wishes.forEach(wish => {
            var newEntry = {
                item: wish.item,
                done: wish.done
            };

            app.wishList.push(newEntry);
        });
    }));
}

function reloadJournal() {
    fetch(JOURNAL_API)
    .then(response => response.json()
    .then(journals => {
        app.pastJournals = [];
        journals.reverse();
        journals.forEach(singleJournal => {
            var newEntry = {
                entry: singleJournal.entry,
                date: singleJournal.dateString
            };

            app.pastJournals.push(newEntry);
        });
    }));
}

var loadedQuotes = [];
const quoteRequest = new XMLHttpRequest();
quoteRequest.open("GET", "https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous&count=3");
quoteRequest.setRequestHeader("X-Mashape-Key", "3gtrMj4smYmshgTK0ZynVBck1oIXp15HXJsjsnQqPYpWYAfJtK");
quoteRequest.timeout = 5000;
quoteRequest.setRequestHeader("Accept", "application/json");
quoteRequest.onload = function () {
    if(quoteRequest.status === 200) {
        const quoteRes = JSON.parse(quoteRequest.responseText);
        loadedQuotes = [];
        app.quoteOfDay = loadedQuotes;

        for(var i = 0; i < quoteRes.length; i++) {
            const defaultQuote = {
                quote: quoteRes[i].quote,
                author: quoteRes[i].author
            };

            loadedQuotes.push(defaultQuote);
        }

        app.quoteOfDay = loadedQuotes
    }
}
quoteRequest.ontimeout = function () {
    const defaultQuote = {
        quote: "When your internet is slow, quotes don't load",
        author: "Someone smart"
    };

    loadedQuotes = [];
    loadedQuotes.push(defaultQuote);
}

quoteRequest.send();
reloadJournal();
reloadWishes();