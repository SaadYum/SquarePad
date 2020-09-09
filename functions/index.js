const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ContentBasedRecommender = require("content-based-recommender");
const recommend = require("collaborative-filter");

var rp = require("request-promise");
// const { FlingGestureHandler } = require("react-native-gesture-handler");
const mykey = "AIzaSyBaUWUZCAN9s7X7CvNVOEm6t4lQ7ZKE-3A";
const recommender = new ContentBasedRecommender({
  minScore: 0.1,
  maxSimilarDocuments: 100,
});

const items = [
  {
    interest: "Photography",
    id: 1,
    placetype: [
      "florist",
      "travel_agency",
      "library",
      "aquarium",
      "museum",
      "mosque",
      "park",
      "supermarket",
      "tourist_attraction",
      "zoo",
    ],
  },
  {
    interest: "Research",
    id: 2,
    placetype: [
      "police",
      "post_office",
      "university",
      "lawyer",
      "airport",
      "museum",
      "book_store",
    ],
  },
  {
    interest: "Music",
    id: 3,
    placetype: [, "movie_theater", "night_club", "casino", "church"],
  },
  {
    interest: "Vlogs",
    id: 4,
    placetype: [
      "taxi_stand",
      "train_station",
      "library",
      "aquarium",
      "museum",
      "mosque",
      "park",
      "supermarket",
      "tourist_attraction",
      "zoo",
    ],
  },
  { interest: "Tech", id: 5, placetype: ["electronics_store", "store"] },
  {
    interest: "Food",
    id: 6,
    placetype: [
      "meal_delivery",
      "meal_takeaway",
      "bar",
      "bakery",
      "cafe",
      "restaurant",
    ],
  },
  {
    interest: "Parks",
    id: 7,
    placetype: [
      "stadium",
      "zoo",
      "park",
      "museum",
      "bowling_alley",
      "aquarium",
    ],
  },
  { interest: "Cafes", id: 8, placetype: ["cafe"] },
  { interest: "Books", id: 10, placetype: ["library", "book_store"] },
  {
    interest: "Cars",
    id: 11,
    placetype: [
      "car_dealer",
      "car_rental",
      "car_repair",
      "car_wash",
      "gas_station",
    ],
  },
  { interest: "Movies", id: 12, placetype: [, "movie_theater"] },
  {
    interest: "Education",
    id: 13,
    placetype: ["school", "secondary_school", "university"],
  },
  {
    interest: "Shopping",
    id: 14,
    placetype: ["supermarket", "drugstore", "doctor"],
  },
  {
    interest: "Sports",
    id: 15,
    placetype: ["stadium", "campground", "bowling_alley"],
  },
  { interest: "Culture", id: 16, placetype: [, "mosque", "place_of_worship"] },
];
const todos = [
  {
    interest: "Photography",
    id: 1,
    todos: ["Photography", "Make Movies"],
  },
  {
    interest: "Research",
    id: 2,
    todos: ["Research"],
  },
  {
    interest: "Music",
    id: 3,
    todos: ["Find out local musical instruments", "Listen local music"],
  },
  {
    interest: "Vlogs",
    id: 4,
    todos: ["Make Vlogs", "Cinematography"],
  },
  { interest: "Tech", id: 5, todos: [] },
  {
    interest: "Food",
    id: 6,
    todos: ["Desi Food", "Western Food", "Chinese Food"],
  },
  {
    interest: "Parks",
    id: 7,
    todos: ["Hiking", "Running", "Play local games"],
  },
  { interest: "Cafes", id: 8, todos: ["Discover Cafes", "Discover Bakeries"] },
  { interest: "Books", id: 10, todos: ["Discover libraries"] },
  {
    interest: "Cars",
    id: 11,
    todos: ["Find Good Cars"],
  },
  { interest: "Movies", id: 12, todos: ["Watch Movies"] },
  {
    interest: "Education",
    id: 13,
    todos: [],
  },
  {
    interest: "Shopping",
    id: 14,
    todos: ["Shopping"],
  },
  {
    interest: "Sports",
    id: 15,
    todos: ["Play games"],
  },
  {
    interest: "Culture",
    id: 16,
    todos: ["Meet Locals", "Try Local Food", "Listen stories of folks"],
  },
];

const items2 = [
  {
    interest: "Photography",
    id: 1,
    placetype:
      "florist travel_agency library aquarium amusement_park art_gallery museum mosque park shopping_mall supermarket tourist_attraction hindu_temple zoo",
  },
  {
    interest: "Research",
    id: 2,
    placetype: "police post_office university lawyer airport museum book_store",
  },
  {
    interest: "Music",
    id: 3,
    placetype:
      "movie_rental movie_theater night_club casino church shopping_mall",
  },
  {
    interest: "Vlogs",
    id: 4,
    placetype:
      "taxi_stand train_station transit_station travel_agency subway_station library aquarium amusement_park art_gallery museum mosque park shopping_mall supermarket tourist_attraction hindu_temple zoo",
  },
  {
    interest: "Tech",
    id: 5,
    placetype: "electronics_store store shopping_mall",
  },
  {
    interest: "Food",
    id: 6,
    placetype: "meal_delivery meal_takeaway bar bakery cafe restaurant",
  },
  {
    interest: "Parks",
    id: 7,
    placetype:
      "stadium zoo park museum bowling_alley art_gallery amusement_park aquarium",
  },
  { interest: "Cafes", id: 8, placetype: "cafe" },
  { interest: "Books", id: 10, placetype: "library book_store" },
  {
    interest: "Cars",
    id: 11,
    placetype: "car_dealer car_rental car_repair car_wash gas_station",
  },
  { interest: "Movies", id: 12, placetype: "movie_rental movie_theater" },
  {
    interest: "Education",
    id: 13,
    placetype: "school secondary_school university",
  },
  {
    interest: "Shopping",
    id: 14,
    placetype:
      "jewelry_store hardware_store home_goods_store hair_care grocery_or_supermarket supermarket furniture_store store florist shopping_mall electronics_store shoe_store drugstore doctor department_store dentist clothing_store convenience_store pet_store physiotherapist liquor_store locksmith   ",
  },
  { interest: "Sports", id: 15, placetype: "stadium campground bowling_alley" },
  {
    interest: "Culture",
    id: 16,
    placetype: "hindu_temple mosque place_of_worship",
  },
];

admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

const createCommentNotification = (notification) => {
  return admin
    .firestore()
    .collection("notifications")
    .doc(`${notification.postUserId}`)
    .collection("userNotifications")
    .add(notification)
    .then((doc) => console.log("notification added", notification));
};
const createPlanNotification = (notification) => {
  return admin
    .firestore()
    .collection("notifications")
    .doc(`${notification.userId}`)
    .collection("userNotifications")
    .add(notification)
    .then((doc) => console.log("notification added", notification));
};

const removeDuplicateWords = (s) => {
  // your perfect code...
  var str = s.split(" ");
  var result = [];
  for (var i = 0; i < str.length; i++) {
    //if(result.indexOf(str[i]) == -1) result.push(str[i]);
    if (result.indexOf(str[i]) === -1) {
      result.push(str[i]);
    }
  }
  return result.join(" ");
};

const getFormattedDate = (newDate) => {
  let formatted_date =
    newDate.getFullYear() +
    "-" +
    (newDate.getMonth() + 1) +
    "-" +
    newDate.getDate() +
    " " +
    newDate.getHours() +
    ":" +
    newDate.getMinutes();

  return formatted_date;
};

exports.listenComments = functions.firestore
  .document("comments/{postId}/userComments/{userCommentId}")
  .onCreate((doc, context) => {
    const comment = doc.data();
    const notification = {
      type: "comment",
      content: "Commented on your post",
      postId: `${context.params.postId}`,
      user: `${comment.username}`,
      userId: `${comment.userId}`,
      postUserId: `${comment.postUserId}`,
      time: admin.firestore.FieldValue.serverTimestamp(),
    };

    return createCommentNotification(notification);
  });

exports.listenRecommendedPlan = functions.firestore
  .document("plans/{userId}/userPlans/{planId}")
  .onWrite((doc, context) => {
    if (doc.after.data().recommended) {
      if (doc.after.data().status == "ready") {
        const notification = {
          content:
            "Your Plan for: " +
            doc.after.data().destination +
            " is ready! You can check it out in your Profile Plans",
          userId: `${context.params.userId}`,
          type: "plan",
          time: admin.firestore.FieldValue.serverTimestamp(),
        };

        return createPlanNotification(notification);
      }
    }
  });

const generateUserRecommendations = (userId, users) => {
  recommender.train(users);
  const similarDocuments = recommender.getSimilarDocuments(userId, 0, 2);
  console.log(similarDocuments);
  admin
    .firestore()
    .collection("userRecommendations")
    .doc(`${userId}`)
    .collection("recommendedUsers")
    .doc(`${userId}`)
    .set({
      users: similarDocuments,
    })
    .then((doc) => console.log("UserRecommendation added", doc));
};

const generatePlaceRecommendations = (places, userId) => {
  admin
    .firestore()
    .collection("placesRecommendations")
    .doc(`${userId}`)
    .collection("recommendedPlaces")
    .doc(`${userId}`)
    .set({
      places: places,
    })
    .then((doc) => console.log("PlacesRecommendation added Successfully"));

  // places.forEach((place) => {
  //   admin
  //     .firestore()
  //     .collection("placesForTraining")
  //     .doc(place.id)
  //     .set(
  //       {
  //         place: place,
  //         // placeId: place.id,
  //         likes: [],
  //       },
  //       { merge: true }
  //     )
  //     .then("Places For Recommendation Added Too");
  // });
};

const setRecommendedPlan = (
  planId,
  userId,
  finalTourSpots,
  finalFoodSpots,
  todos
) => {
  let finalSpots = finalTourSpots.concat(finalFoodSpots);
  finalSpots = Array.from(new Set(finalSpots));

  admin
    .firestore()
    .collection("plans")
    .doc(`${userId}`)
    .collection("userPlans")
    .doc(`${planId}`)
    .set(
      {
        spots: finalSpots,
        foodSpots: finalFoodSpots,
        todos: todos,
        status: "ready",
      },
      { merge: true }
    )
    .then((doc) => console.log("Plan updated Successfully"));
};

calDistance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    } //Kilometer
    if (unit == "M") {
      dist = dist * 0.8684;
    } //Miles
    return dist;
  }
};

const findNewCoordinates = (lat, lng) => {
  let r_earth = 6371;

  // East 50km
  let lat1 = lat + (50 / r_earth) * (180 / Math.PI);
  let lng1 =
    lng + ((0 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
  let p1 = { lat: lat1, lng: lng1 };

  // West 50km
  let lat2 = lat + (0 / r_earth) * (180 / Math.PI);
  let lng2 =
    lng + ((50 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);

  let p2 = { lat: lat2, lng: lng2 };

  // North 50km
  let lat3 = lat + (-50 / r_earth) * (180 / Math.PI);
  let lng3 =
    lng + ((0 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
  let p3 = { lat: lat3, lng: lng3 };

  // South 50km
  let lat4 = lat + (0 / r_earth) * (180 / Math.PI);
  let lng4 =
    lng + ((-50 / r_earth) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
  let p4 = { lat: lat4, lng: lng4 };

  let points = [p1, p2, p3, p4];
  return points;
};

const getPlacesUrl = (lat, long, radius, type) => {
  const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
  const location = `location=${lat},${long}&radius=${radius}`;
  const typeData = `&keyword=${type}`;

  const api = `&key=${mykey}`;
  // console.log(`${baseUrl}${location}${typeData}${api}`);
  return `${baseUrl}${location}${typeData}${api}`;
};

const getPhotosArr = async (place_id) => {
  let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,geometry,photos,rating,formatted_phone_number&key=${mykey}`;
  let photos = [];
  let myRes = await rp(url)
    .then((res) => JSON.parse(res))
    .then((result) => {
      let res = result.result;
      if (typeof res.photos !== "undefined") {
        // res.photos.map((photo) => {
        //   let url = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&sensor=false&maxheight=${photo.height}&maxwidth=${photo.width}&key=${mykey}`;
        //   photos.push(url);
        // });

        let url = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${res.photos[0].photo_reference}&sensor=false&maxheight=500&maxwidth=500&key=${mykey}`;
        photos.push(url);
      }
      return photos;
    });
  return myRes;
};

const updatePlacesRecommendations = (userId, lat, lng) => {
  var promise = new Promise((resolve, reject) => {
    let coordinates = findNewCoordinates(lat, lng);
    let places = [];

    // var promise = new Promise((resolve, reject)=>{
    let promises = [];

    coordinates.forEach((point) => {
      const url = getPlacesUrl(
        point.lat,
        point.lng,
        50000,
        "tourist_attraction"
      );
      promises.push(
        rp(url)
          .then((res) => JSON.parse(res))
          .then((res) => {
            places.push(res.results);
          })
      );
    });

    Promise.all(promises).then(() => {
      places = [].concat.apply([], places);

      // return places;
      // console.log('Places length 1: ', places.length);

      const uniquePlaces = Array.from(
        new Set(places.map((a) => a.place_id))
      ).map((place_id) => {
        return places.find((a) => a.place_id === place_id);
      });

      places = uniquePlaces;

      // places = Array.from(new Set(places)); // Removing Duplicates
      // console.log('Places length 2: ', places.length);

      resolve(places);
    });
  });
  promise.then((places) => {
    generatePlaceRecommendations(places, userId);

    // console.log("Places: ", places);
  });
};

const updatePlacesRecommendations2 = (userId, lat, lng) => {
  let followedUsers = [];
  let interestArrays = []; // Array of arrays
  let weightedInterestsArr = [];
  let currentUserInterestsArr = [];
  let overallInterests = [];
  let previousDestinationtypes = [];
  let overallInterestsTypes = [];
  // 1. GET ALL FOLLOWING USERS
  admin
    .firestore()
    .collection("following")
    .doc(`${userId}`)
    .collection("userFollowing")
    .get()
    .then((snap) => {
      snap.forEach((doc) => {
        followedUsers.push(doc.id);
      });
    })
    .then(() => {
      // 2. GET INTERESTS OF EACH FOLLOWED USER

      var promise = new Promise((resolve, reject) => {
        if (followedUsers.length) {
          var interestArrays = [];
          followedUsers.forEach((user) => {
            admin
              .firestore()
              .collection("users")
              .doc(user)
              .get()
              .then((doc) => {
                if (doc.data().interested) {
                  interestArrays.push(doc.data().interestsArr);
                }
              })
              .then(() => {
                resolve(interestArrays);
              });
          });
        }
      });

      promise.then((interestArrays) => {
        var promise = new Promise((resolve, reject) => {
          // 3. GET WEIGHTAGE OF INTERESTS
          let interestTagArray = [];
          // console.log("Extra",interestArrays);
          if (interestArrays.length > 0) {
            interestArrays.forEach((interestArr) => {
              interestArr.forEach((interest) => {
                let foundObject = interestTagArray.find((o, i) => {
                  if (o.interest === interest) {
                    let count = o.count + 1;
                    arr[i] = { interest: interest, count: count, No: o.No };
                    return true; // stop searching
                  }
                });
                if (!foundObject) {
                  let newObj = {
                    interest: interest,
                    count: 1,
                    No: interestTagArray.length + 1,
                  };
                  interestTagArray.push(newObj);
                }
              });
            });

            interestTagArray.forEach((element) => {
              let name = element.interest;
              let weight = element.count / interestArrays.length;

              if (weight > 0.6) {
                let weightedInterestObj = {
                  interest: name,
                  weight: weight * 0.4,
                }; // 40% for following users
                weightedInterestsArr.push(weightedInterestObj);
              }
            });
          }
          // console.log("Following User Interests: ", weightedInterestsArr);

          resolve();
        });

        promise.then(() => {
          //3. Current User's Interests
          var promise = new Promise((resolve, reject) => {
            admin
              .firestore()
              .collection("users")
              .doc(userId)
              .get()
              .then((doc) => {
                if (doc.data().interested) {
                  let interestsArr = doc.data().interestsArr;
                  console.log("My Interests", interestsArr);
                  interestsArr.forEach((element) => {
                    let elementObj = { interest: element, weight: 0.6 }; // 60% for current user
                    currentUserInterestsArr.push(elementObj);
                  });
                }
                // console.log("Current User Interests: ", currentUserInterestsArr);
                resolve();
              });
          });
          promise.then(() => {
            //4. Combine interests
            var promise = new Promise((resolve, reject) => {
              if (
                currentUserInterestsArr.length ||
                weightedInterestsArr.length
              ) {
                if (!currentUserInterestsArr.length) {
                  // Only weightage of following users interests
                  overallInterests = weightedInterestsArr;
                } else if (!weightedInterestsArr.length) {
                  // Only weightage of current user interests
                  overallInterests = currentUserInterestsArr;
                } else {
                  // Combine both type of Interests 60% user's and 40% followings
                  currentUserInterestsArr.forEach((interestObj) => {
                    let comparedObj = weightedInterestsArr.find(
                      (o) => o.interest === interestObj.interest
                    );
                    if (comparedObj) {
                      let weight = interestObj.weight + comparedObj.weight;
                      let newObj = {
                        interest: interestObj.interest,
                        weight: weight,
                      };
                      overallInterests.push(newObj);
                    } else {
                      overallInterests.push(interestObj);
                    }
                  });

                  // Add the remaining Objs
                  weightedInterestsArr.forEach((interestObj) => {
                    let comparedObj = overallInterests.find(
                      (o) => o.interest === interestObj.interest
                    );
                    if (!comparedObj) {
                      overallInterests.push(interestObj);
                    }
                  });

                  // Filter only whose interests which have weight >0.8

                  let filtered = overallInterests.filter((interestObj) => {
                    return interestObj.weight >= 0.7;
                  });
                  overallInterests = filtered;
                }
              }

              //sorting interests from max weight to min
              overallInterests.sort((a, b) => {
                return b.weight - a.weight;
              });

              let tempArr = [];
              // Keeping Just Interests ... removing weights
              overallInterests.forEach((element) => {
                tempArr.push(element.interest);
              });
              overallInterests = tempArr;

              // console.log("overallInterests", overallInterests);
              resolve();
            });

            promise.then(() => {
              // Overall iterests array is completed.
              //  get travel history
              var promise = new Promise((resolve, reject) => {
                let plans = [];
                // admin.firestore().collection('plans').doc(`${userId}`).collection('userPlans').where('ended', '==', true)
                admin
                  .firestore()
                  .collection("plans")
                  .doc(`${userId}`)
                  .collection("userPlans")
                  .get()
                  .then((querySnap) => {
                    querySnap.forEach((plan) => {
                      plans.push(plan.data());
                    });
                    resolve(plans);
                  });
              });

              promise.then((plans) => {
                let types = [];

                if (plans.length) {
                  plans.forEach((plan) => {
                    types.push(plan.destinationTypes);
                  });
                  previousDestinationtypes = [].concat.apply([], types); // Merging elements of types into one single array
                  previousDestinationtypes = Array.from(
                    new Set(previousDestinationtypes)
                  ); // Removing Duplicates
                }

                // Now we've an overallInterestsArray and previousDestinationtypes
                // We need to query from this info

                // console.log("2nd Prints",overallInterests); // [ interest]

                // Take all the places types according to interests

                overallInterests.forEach((interest) => {
                  let comparedObj = items.find((o) => o.interest === interest);
                  overallInterestsTypes.push(comparedObj.placetype);
                });

                // previousDestinationtypes = previousDestinationtypes.toString(); // converting to same form as item 'type1,type2'
                // previousDestinationtypes.replace(/,/g," ");     // removing commas [type1 type2]

                // console.log("Previous Destination types", previousDestinationtypes); // [ food cafe ] etc

                // overallInterestsTypes = overallInterestsTypes.join(" ");

                //******************* */ overallInterestsTypes.concat(previousDestinationtypes);

                // overallInterestsTypes = Array.from(new Set(overallInterestsTypes)); // Removing Duplicates
                // console.log("Final types 1", overallInterestsTypes);
                // overallInterestsTypes = removeDuplicateWords(overallInterestsTypes.toString());
                // console.log("Final types 2", overallInterestsTypes);

                var promise = new Promise((resolve, reject) => {
                  let coordinates = findNewCoordinates(lat, lng);
                  let places = [];

                  // var promise = new Promise((resolve, reject)=>{
                  let promises = [];

                  coordinates.forEach((point) => {
                    const url = getPlacesUrl(
                      point.lat,
                      point.lng,
                      50000,
                      "tourist_attraction"
                    );
                    promises.push(
                      rp(url)
                        .then((res) => JSON.parse(res))
                        .then((res) => {
                          places.push(res.results);
                        })
                    );
                  });

                  Promise.all(promises).then(() => {
                    places = [].concat.apply([], places);

                    // return places;
                    // console.log('Places length 1: ', places.length);

                    const uniquePlaces = Array.from(
                      new Set(places.map((a) => a.place_id))
                    ).map((place_id) => {
                      return places.find((a) => a.place_id === place_id);
                    });

                    places = uniquePlaces;

                    // places = Array.from(new Set(places)); // Removing Duplicates
                    // console.log('Places length 2: ', places.length);

                    resolve(places);
                  });
                });
                promise.then((places) => {
                  generatePlaceRecommendations(places, userId);

                  // console.log("Places: ", places);
                });
              });
            });
          });
        });
      });

      // admin.firestore().collection('placesRecommendations').doc(`${userId}`).collection('recommendedUsers')
      // .add({
      //     users: similarDocuments
      // })
      // .then(doc=>console.log("UserRecommendation added", doc))
    });
};

// exports.listenLocation = functions.firestore
//   .document("user/{userId}")
//   .onUpdate((doc) => {
//     let allusers = [];
//     let updatedUserId = doc.after.id;
//     let updatedUserLat = doc.after.data().location.latitude;
//     let updatedUserLong = doc.after.data().location.longitude;

//     return updatePlacesRecommendations(
//       updatedUserId,
//       updatedUserLat,
//       updatedUserLong
//     );
//   });

const generateRecommendedPlan = async (
  planId,
  destination_id,
  creatorId,
  location,
  startDate,
  endDate
) => {
  let sDate = new Date(startDate);
  let eDate = new Date(endDate);
  //   eDate.setHours(eDate.getHours() + 23);
  //   let days = (eDate - sDate) / 86400000;
  //   let hours = days * 24;

  let userInterests = [];
  let interestPlaceTypes = [];
  let touristSpots = [];
  let foodSpots = [];
  let finalSpots = [];
  let finalFoodSpots = [];
  let finalTourSpots = [];
  let finalTodos = [];
  await admin
    .firestore()
    .collection("users")
    .doc(creatorId)
    .get()
    .then((doc) => {
      userInterests = doc.data().interestsArr;
      userInterests.map((interest) => {
        let todoObjsArr = [];
        let todoArr = todos.find((todo) => todo.interest == interest).todos;
        todoArr.map((todo) => {
          let todoObj = { checked: false, todo: todo };
          todoObjsArr.push(todoObj);
        });
        finalTodos = finalTodos.concat(todoObjsArr);
      });
    })
    .catch((err) => console.log(err));

  /// TOURIST SPOTS
  let url = getPlacesUrl(
    location.latitude,
    location.longitude,
    5000,
    "tourist_attraction"
  );

  console.log(url);
  await rp(url)
    .then((res) => JSON.parse(res))
    .then((res) => {
      touristSpots = res.results;
      return res.results;
    })
    .catch((err) => {
      console.log(err);
    });

  touristSpots = touristSpots.filter((spot) => {
    return spot.place_id != destination_id;
  });
  //   console.log("SPOSTS: ", touristSpots);
  Promise.all(
    touristSpots.map(async (spot) => {
      let photos = await getPhotosArr(spot.place_id).then((photos) => {
        return photos;
      });

      let spotObj = {
        startDateTime: "",
        endDateTime: "",
        //   endDateTime: "2020-04-22 13:00",
        location: {
          latitude: spot.geometry.location.lat,
          longitude: spot.geometry.location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        name: spot.name,
        photos: photos,
        place_id: spot.place_id,
      };

      finalTourSpots.push(spotObj);
      Promise.resolve();
    })
  ).then(async () => {
    // console.log("TOUR SPOTS 1", finalTourSpots);

    /// FOOD SPOTS

    url = getPlacesUrl(location.latitude, location.longitude, 5000, "food");

    console.log("FOOD URL:", url);
    await rp(url)
      .then((res) => JSON.parse(res))
      .then((res) => {
        foodSpots = res.results;
        return res.results;
      })
      .catch((err) => {
        console.log(err);
      });

    foodSpots = foodSpots.filter((spot) => {
      return spot.rating > 3.5;
    });

    //   console.log("FOOD SPOSTS: ", foodSpots);
    Promise.all(
      foodSpots.map(async (spot) => {
        let photos = await getPhotosArr(spot.place_id).then((photos) => {
          return photos;
        });

        let spotObj = {
          startDateTime: "",
          endDateTime: "",
          //   endDateTime: "2020-04-22 13:00",
          location: {
            latitude: spot.geometry.location.lat,
            longitude: spot.geometry.location.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          name: spot.name,
          photos: photos,
          place_id: spot.place_id,
        };

        finalFoodSpots.push(spotObj);
        Promise.resolve();
      })
    ).then(async () => {
      //   console.log("FOOD SPOTS 1", finalFoodSpots);
      //   let finalTourSpotsImage = JSON.parse(JSON.stringify(finalTourSpots));
      //   let finalFoodSpotsImage = JSON.parse(JSON.stringify(finalFoodSpots));
      let foodIndex = 0;
      let tourIndex = 0;

      // NOW WILL ASSIGN TIMINGS FOR SPOTS
      while (sDate <= eDate) {
        // startDate
        let hours = sDate.getHours();

        if (hours < 8) {
          while (hours < 8) {
            hours++;
          }
          sDate.setHours(hours);
        }
        // starting day at 8 am

        let currHours = sDate.getHours();
        //FOOD TIMES
        if (
          (currHours >= 8 && currHours < 10) || //8-10am
          (currHours >= 13 && currHours < 15) || //1-3pm
          (currHours >= 21 && currHours < 23) //9-11pm
        ) {
          if (finalFoodSpots.length > 0) {
            if (foodIndex < finalFoodSpots.length) {
              let startDateTime = getFormattedDate(sDate);
              sDate.setHours(sDate.getHours() + 2);
              let endDateTime = getFormattedDate(sDate);
              finalFoodSpots[foodIndex].startDateTime = startDateTime;
              finalFoodSpots[foodIndex].endDateTime = endDateTime;
              foodIndex++;
            } else {
              sDate.setHours(sDate.getHours() + 2);
            }
            // else {
            //   //   foodIndex = 0; // repeat array
            //   finalFoodSpots = Array.from(
            //     finalFoodSpots.concat(finalFoodSpotsImage)
            //   ); // Double with repeated Elements
            //   let startDateTime = getFormattedDate(sDate);
            //   sDate.setHours(sDate.getHours() + 2);
            //   let endDateTime = getFormattedDate(sDate);
            //   finalFoodSpots[foodIndex].startDateTime = startDateTime;
            //   finalFoodSpots[foodIndex].endDateTime = endDateTime;
            //   foodIndex++;
            // }
          } else {
            sDate.setHours(sDate.getHours() + 2);
          }
        } else {
          // TOURISM SPOTS TIMING
          if (sDate.getHours() < 23) {
            if (finalTourSpots.length > 0) {
              if (tourIndex < finalTourSpots.length) {
                let startDateTime = getFormattedDate(sDate);
                sDate.setHours(sDate.getHours() + 3);
                let endDateTime = getFormattedDate(sDate);
                finalTourSpots[tourIndex].startDateTime = startDateTime;
                finalTourSpots[tourIndex].endDateTime = endDateTime;
                tourIndex++;
                console.log("TOUR ADDED ", endDateTime);
              } else {
                sDate.setHours(sDate.getHours() + 3);
              }
              //   else {
              //     //   tourIndex = 0; // repeat array
              //     finalTourSpots = Array.from(
              //       finalTourSpots.concat(finalTourSpotsImage)
              //     ); // Double with repeated Elements

              //     let startDateTime = getFormattedDate(sDate);
              //     sDate.setHours(sDate.getHours() + 3);
              //     let endDateTime = getFormattedDate(sDate);
              //     finalTourSpots[tourIndex].startDateTime = startDateTime;
              //     finalTourSpots[tourIndex].endDateTime = endDateTime;
              //     tourIndex++;
              //     console.log("TOUR ADDED and REPEATED", endDateTime);
              //   }
            } else {
              sDate.setHours(sDate.getHours() + 3);
            }
          } else {
            sDate.setHours(sDate.getHours() + 6);
          }
        }
      }
      finalTourSpots = finalTourSpots.filter(
        (spot) => spot.startDateTime !== ""
      );
      finalFoodSpots = finalFoodSpots.filter(
        (spot) => spot.startDateTime !== ""
      );

      //   console.log("FINAL 2 SPOTS", finalTourSpots);
      //   console.log("FINAL 2  FOOD", finalFoodSpots);
      //   console.log("FINAL TODOS", finalTodos);
      setRecommendedPlan(
        planId,
        creatorId,
        finalTourSpots,
        finalFoodSpots,
        finalTodos
      );

      // TODOS
    });
  });
};

exports.listenPlans = functions.firestore
  .document("plans/{userId}/userPlans/{planId}")
  .onCreate((doc, context) => {
    let destination_id = doc.data().destination_id;
    let destinationTypes = doc.data().destinationTypes;
    let name = doc.data().name;
    let images = doc.data().images;
    let location = doc.data().location;
    let startDate = doc.data().startDate;
    let endDate = doc.data().endDate;
    let dateCreated = doc.data().dateCreated;
    let creatorId = doc.data().creatorId;

    if (doc.data().recommended) {
      generateRecommendedPlan(
        doc.id,
        destination_id,
        creatorId,
        location,
        startDate,
        endDate
      );
    }
    return 0;
  });

exports.listenPlacesLikes = functions.firestore
  // .document("placesForFiltering/{placeId}/likes/{userId}")
  .document("placesForFiltering/{placeId}")
  .onWrite(async (doc, context) => {
    processCollaborativeRecommendations(context.params.placeId);
  });

processCollaborativeRecommendations = async (placeId) => {
  let matrix = [];
  let places = [];
  let users = [];

  let numUsers, numPlaces;

  // GET ALL PLACES
  await admin
    .firestore()
    .collection("placesForFiltering")
    .get()
    .then((docs) => {
      numPlaces = docs.size;
      let index = 0;
      docs.forEach((doc) => {
        let place = doc.data().place;
        let placeObj = {
          index: index,
          place_id: doc.data().place.place_id,
          likes: doc.data().likes,
          place: place,
        };
        places.push(placeObj);
        index++;
      });
    })
    .then(async () => {
      //GET ALL USERS
      // console.log("Places", places);
      await admin
        .firestore()
        .collection("users")
        .get()
        .then((docs) => {
          numUsers = docs.size;
          let index = 0;
          docs.forEach((doc) => {
            let userObj = {
              index: index,
              userId: doc.id,
            };
            users.push(userObj);
            index++;
          });
        })
        .then(() => {
          // MAKE ROW ARRAY e.g [1,0,1,1]

          // console.log("USers", users);
          Promise.all(
            users.map((user) => {
              let matrixRow = [];
              let places1 = places;
              Promise.all(
                places1.map((place) => {
                  if (place.likes.includes(user.userId)) {
                    matrixRow.push(1);
                    Promise.resolve();
                  } else {
                    matrixRow.push(0);
                    Promise.resolve();
                  }
                })
              ).then(() => {
                // console.log("PUSHED ROW", matrixRow);
                matrix.push(matrixRow);
                Promise.resolve();
              });
            })
          ).then(() => {
            // console.log("MATRIX", matrix);
            // console.log("places", places);

            users.map((user) => {
              let results = recommend.cFilter(matrix, user.index);
              console.log(results);
              let recommendedPlaces = [];
              Promise.all(
                results.map((index) => {
                  if (index >= 0) {
                    let place = places.find((place) => place.index == index);
                    console.log("PLACES RESI", place);
                    recommendedPlaces.push(place.place);
                  }
                  Promise.resolve();
                })
              ).then(async () => {
                // recommendedPlaces.map((place))
                await admin
                  .firestore()
                  .collection("userSuggestedPlaces")
                  .doc(user.userId)
                  .set({
                    places: recommendedPlaces,
                  })
                  .then(() => {
                    console.log(recommendedPlaces);
                    console.log("CF Places add to user" + user.userId);
                  })
                  .catch((err) => console.log(err));
              });
            });

            // console.log("Results", result);
            // const result = recommend.getRecommendations(
            //   ratings,
            //   coMatrix,
            //   userIndex
            // );
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.listenInterests = functions.firestore
  .document("users/{userId}/interests/{interestId}")
  .onWrite(async (doc, context) => {
    let allusers = [];
    let updatedUserId = context.params.userId;
    let updatedUserLat = "";
    let updatedUserLong = "";

    await admin
      .firestore()
      .collection("users")
      .doc(updatedUserId)
      .get()
      .then((doc) => {
        updatedUserLat = doc.data().location.latitude;
        updatedUserLong = doc.data().location.longitude;
      });

    return admin
      .firestore()
      .collection("users")
      .where("interested", "==", true)
      .get()
      .then((users) => {
        users.forEach((user) => {
          let currentUserLat = user.data().location.latitude;
          let currentUserLong = user.data().location.longitude;
          let distance = calDistance(
            updatedUserLat,
            updatedUserLong,
            currentUserLat,
            currentUserLong,
            "K"
          );

          if (distance < 100) {
            // within 100 Km

            let contentObj = {
              id: user.id,
              content: user.data().interestsArr.join(" "),
            };
            allusers.push(contentObj);
          }
        });
        console.log(allusers);
        generateUserRecommendations(updatedUserId, allusers);
        updatePlacesRecommendations(
          updatedUserId,
          updatedUserLat,
          updatedUserLong
        );
      });
  });
