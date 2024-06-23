$(document).ready(async function () {

    const clientId = '';// your spotify app client id
    const clientSecret = '';// your spotify app client secret

    // update this whenever need to redirect to specific page
    const redirectUri = 'http://localhost:5500/design.html';//change redirect uri according to your project structure
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-library-modify', 'user-library-read', 'user-modify-playback-state', 'user-top-read', 'user-follow-read', 'playlist-modify-public', 'playlist-modify-private'];

    let accessToken;

    async function authorizeUser() {
        const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}`;
        window.location.href = authorizeUrl;
    }

    // function saveAccessToken(token) {
    //     localStorage.setItem('spotifyAccessToken', token);
    // }

    async function exchangeAuthorizationCode(code) {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
        });

        const data = await response.json();
        // saving the access token
        // saveAccessToken(data.access_token); 
        // return data;
        accessToken = data.access_token;
        return data;
    }
    async function getCurrentUserID() {
        const apiUrl = 'https://api.spotify.com/v1/me';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        console.log(data.id);
        return data.id;
    }
    async function createNewPlaylist(userID, playListName, playListDescription, typeOfPlaylist) {
        const response = await fetch('https://api.spotify.com/v1/users/' + userID + '/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify({
                "name": playListName,
                "description": playListDescription,
                "public": typeOfPlaylist
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Playlist created:', data);
            alert('Playlist created successfully!');
            window.location.href = "http://localhost/project/design.html";
        } else {
            console.error('Error creating playlist:', response.statusText);
            alert('Failed to create playlist. Please try again.');
        }
    }


    //add to playlist
    async function addtoPlaylist(playlistID, trackID) {
        const response = await fetch('https://api.spotify.com/v1/playlists/' + playlistID + '/tracks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackID}`],
                position: 0
            })
        });
    }

    async function fetchApiData(url) {
        const storedToken = accessToken;
        // const storedToken = localStorage.getItem('spotifyAccessToken');
        if (!storedToken) {
            // redirecting user for authorization if token is not available
            authorizeUser();
            return;
        }
        const result = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await result.json();
        return data;
    }

    async function fetchPopularSongs() {
        const apiUrl = 'https://api.spotify.com/v1/browse/featured-playlists';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        const randomPlaylistIndex = Math.floor(Math.random() * data.playlists.items.length);
        const randomPlaylistId = data.playlists.items[randomPlaylistIndex].id;

        const playlistTracksUrl = `https://api.spotify.com/v1/playlists/${randomPlaylistId}/tracks?limit=100`;
        const tracksResponse = await fetch(playlistTracksUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const tracksData = await tracksResponse.json();
        console.log(tracksData.items);
        getCurrentUserID();
        return tracksData.items;
    }

    async function fetchPopularAlbums() {
        const apiUrl = 'https://api.spotify.com/v1/browse/featured-playlists';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        const randomAlbumIndex = Math.floor(Math.random() * data.playlists.items.length);
        const randomAlbumId = data.playlists.items[randomAlbumIndex].id;

        const albumTracksUrl = `https://api.spotify.com/v1/playlists/${randomAlbumId}/tracks?limit=100&market=IN`;
        const tracksResponse = await fetch(albumTracksUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const tracksData = await tracksResponse.json();
        console.log(tracksData.items);
        return tracksData.items;
    }

    async function fetchPopularArtists() {
        try {
            const apiUrl = 'https://api.spotify.com/v1/artists?ids=0TnOYISbd1XYRBk9myaseg,1QAJqy2dA3ihHBFIHRphZj,6qqNVTkY8uBg9cP3Jd7DAH,6eUKZXaKkcviH0Ku9w2n3V,7Ln80lUS6He07XvHI8qqHH,6KImCVD70vtIoJWnq6nGn3,2oSONSC9zQ4UonDKnLqksx,4dpARuHxo51G3z768sgnrY';
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + accessToken }
            });

            if (!response.ok) {
                console.log('Failed to fetch popular artists');
                throw new Error('Failed to fetch popular artists');
            }

            const data = await response.json();
            return data.artists; // Make sure this is correct
        } catch (error) {
            console.error('Error fetching popular artists:', error);
            throw error;
        }
    }

    async function fetchUserTopArtist() {
        const apiUrl = 'https://api.spotify.com/v1/me/top/artists?limit=20';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        return data.items;
    }
    //function to get top album of the artist
    async function fetchTopTracksOfArtist(artistId) {
        const apiUrl = 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?market=ES';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        return data.tracks;
    }
    // Function to fetch user's top items and display them
    async function displayUserTopArtist() {
        const userTopArtist = await fetchUserTopArtist();
        const userTopArtistList = document.getElementById('user_item_list_artist');

        userTopArtistList.innerHTML = '';

        userTopArtist.forEach((artist, index) => {

            const userItem = document.createElement('li');
            userItem.className = 'userItem';

            const imgPlayDiv = document.createElement('div');
            imgPlayDiv.className = 'img_play';

            const img = document.createElement('img');
            img.src = artist.images[0].url;
            img.alt = artist.name;

            const playIcon = document.createElement('i');
            playIcon.className = 'bi playListPlay bi-play-circle-fill';
            playIcon.id = `playIcon${index}`;

            imgPlayDiv.appendChild(img);
            imgPlayDiv.appendChild(playIcon);

            const h5 = document.createElement('h5');
            h5.innerHTML = `${artist.name}<br><div class="subtitle">${artist.name}</div>`;

            playIcon.addEventListener('click', async () => {
                const topAlbum = await fetchTopTracksOfArtist(artist.id);
                    playAudio(
                        topAlbum[0].preview_url,
                        topAlbum[0].name,
                        topAlbum[0].artists[0].name,
                        topAlbum[0].album.images[0].url,
                        topAlbum[0].id
                    );
            });

            userItem.appendChild(imgPlayDiv);
            userItem.appendChild(h5);

            userTopArtistList.appendChild(userItem);
        });
    }

    async function fetchUserTopTrack() {
        const apiUrl = 'https://api.spotify.com/v1/me/top/tracks?limit=20';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        return data.items;
    }
    // Function to fetch user's top items and display them
    async function displayUserTopTrack() {
        const userTopTrack = await fetchUserTopTrack();
        const userTopTrackList = document.getElementById('user_item_list_track');

        userTopTrackList.innerHTML = '';

        userTopTrack.forEach((track, index) => {

            const userItem = document.createElement('li');
            userItem.className = 'userItem';

            const imgPlayDiv = document.createElement('div');
            imgPlayDiv.className = 'img_play';

            const img = document.createElement('img');
            img.src = track.album.images[0].url;
            img.alt = track.name;

            const playIcon = document.createElement('i');
            playIcon.className = 'bi playListPlay bi-play-circle-fill';
            playIcon.id = `playIcon${index}`;

            imgPlayDiv.appendChild(img);
            imgPlayDiv.appendChild(playIcon);

            const h5 = document.createElement('h5');
            h5.innerHTML = `${track.name}<br><div class="subtitle">${track.name}</div>`;
            playIcon.addEventListener('click', () => {
                playAudio(
                    track.preview_url,
                    track.name,
                    track.artists[0].name,
                    img.src,
                    track.id // Use the image source directly
                );
            });

            userItem.appendChild(imgPlayDiv);
            userItem.appendChild(h5);

            userTopTrackList.appendChild(userItem);
        });
    }

    async function fetchUserFollowedArtist() {
        try {
            const apiUrl = 'https://api.spotify.com/v1/me/following?type=artist';

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + accessToken }
            });

            if (!response.ok) {
                console.log('Failed to fetch popular artists');
                throw new Error('Failed to fetch popular artists');
            }

            const data = await response.json();
            return data.artists; // Make sure this is correct
        } catch (error) {
            console.error('Error fetching popular artists:', error);
            throw error;
        }
    }

    async function displayUserFollowedArtist() {
        try {
            const response = await fetchUserFollowedArtist();
            const artists = response.items;
            const popArtistList = document.getElementById('user_item_list');
            popArtistList.innerHTML = ''; // Clear existing content

            artists.forEach((artist, index) => { // Add index parameter here
                const artistItem = document.createElement('li');
                artistItem.className = 'artistItem';
                const imgPlayDiv = document.createElement('div');
                imgPlayDiv.className = 'img_play';

                const img = document.createElement('img');
                img.src = artist.images[0].url;

                const playIcon = document.createElement('i');
                playIcon.className = 'bi playListPlay bi-play-circle-fill';
                playIcon.id = `artistPlayIcon${index}`;

                imgPlayDiv.appendChild(img);
                imgPlayDiv.appendChild(playIcon);
                
                const h5 = document.createElement('h5');
                h5.innerHTML = artist.name;
                playIcon.addEventListener('click', async () => {
                    const topAlbum = await fetchTopTracksOfArtist(artist.id);                   
                        playAudio(
                            topAlbum[0].preview_url,
                            topAlbum[0].name,
                            topAlbum[0].artists[0].name,
                            topAlbum[0].album.images[0].url,
                            topAlbum[0].id
                        );
                    });

                artistItem.appendChild(imgPlayDiv);
                artistItem.appendChild(h5);

                popArtistList.appendChild(artistItem);
            });
        } catch (error) {
            console.error('Error displaying followed artist:', error);
        }
    }






    async function handleAuthorizationCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get('code');

        if (authorizationCode) {
            const tokenResponse = await exchangeAuthorizationCode(authorizationCode);
            accessToken = tokenResponse.access_token;

            // Fetch random popular tracks and display them when the access token is obtained
            try {
                const userData = await fetchUserProfile();
                updateUserProfile(userData);

                const popularSongs = await fetchPopularSongs();
                displayPopularSongs(popularSongs);

                const userTopArtist = await fetchUserTopTrack();
                displayUserTopArtist(userTopArtist);

                const userTopTrack = await fetchUserTopTrack();
                displayUserTopTrack(userTopTrack);

                const userPlaylist = await fetchUserFollowedArtist();
                displayUserFollowedArtist(userPlaylist);

                const popularAlbums = await fetchPopularAlbums();
                displayPopularAlbums(popularAlbums);

                const popularArtists = await fetchPopularArtists();
                displayPopularArtists(popularArtists);

                // Display user's saved playlists
                displayUserPlaylists();
            } catch (error) {
                //console.error('Error fetching and displaying popular songs:', error);
            }

        } else {
            // If there is no authorization code, initiating the authorization process
            authorizeUser();
        }
    }


    // Function to fetch user profile data
    async function fetchUserProfile() {
        const apiUrl = 'https://api.spotify.com/v1/me';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const userData = await response.json();
        return userData;
    }

    // Function to update the user profile section
    function updateUserProfile(userData) {
        const userImage = document.getElementById('userImage');
        const userName = document.getElementById('userName');

        // Update the user profile image and name
        if (userData.images && userData.images.length > 0) {
            console.log(userData.images[0].url)
            userImage.src = userData.images[0].url;
        } else {
            // Use a default image if no image is available
            userImage.src = 'defaultProfile.png'; // Replace with your default image path
        }
        userName.textContent = userData.display_name;
    }



    async function displayPopularSongs(songs) {
        const popSongList = document.getElementById('popSongList');
        console.log(songs);
        songs.forEach((song, index) => {
            const track = song.track;
            const songItem = document.createElement('li');
            songItem.className = 'songItem';

            const imgPlayDiv = document.createElement('div');
            imgPlayDiv.className = 'img_play';

            const img = document.createElement('img');
            img.src = track.album.images[0].url; // Use appropriate image URL from the API

            const playIcon = document.createElement('i');
            playIcon.className = 'bi playListPlay bi-play-circle-fill';
            playIcon.id = `playIcon${index}`;

            imgPlayDiv.appendChild(img);
            imgPlayDiv.appendChild(playIcon);

            const h5 = document.createElement('h5');
            h5.innerHTML = `${track.name}<br><div class="subtitle">${track.artists[0].name}</div>`;


            playIcon.addEventListener('click', () => {
                playAudio(
                    track.preview_url,
                    track.name,
                    track.artists[0].name,
                    track.album.images[0].url,
                    track.id
                );
            });

            songItem.appendChild(imgPlayDiv);
            songItem.appendChild(h5);

            popSongList.appendChild(songItem);
        });
    }

    async function displayPopularAlbums(albums) {
        const popAlbumList = document.getElementById('popAlbumList');

        albums.forEach((album, index) => {
            const albumItem = document.createElement('li');
            albumItem.className = 'albumItem';

            const imgPlayDiv = document.createElement('div');
            imgPlayDiv.className = 'img_play';

            const img = document.createElement('img');
            img.src = album.track.album.images[0].url;

            const playIcon = document.createElement('i');
            playIcon.className = 'bi playListPlay bi-play-circle-fill';
            playIcon.id = `albumPlayIcon${index}`;

            imgPlayDiv.appendChild(img);
            imgPlayDiv.appendChild(playIcon);

            const h5 = document.createElement('h5');
            h5.innerHTML = `${album.track.album.name}<br><div class="subtitle">${album.track.artists[0].name}</div>`;

            albumItem.addEventListener('click', async () => {
                try {
                    const albumTracks = await fetchAlbumTracks(album.track.album.id);
                    displayAlbumTracks(albumTracks);
                } catch (error) {
                    console.error('Error fetching and displaying album tracks:', error);
                }
            });

            albumItem.appendChild(imgPlayDiv);
            albumItem.appendChild(h5);

            popAlbumList.appendChild(albumItem);
        });
    }

    async function displayPopularArtists() {
        try {
            const artists = await fetchPopularArtists();

            const popArtistList = document.getElementById('popArtistList');
            popArtistList.innerHTML = ''; // Clear existing content

            for (let index = 0; index < artists.length; index++) {
                const artist = artists[index];
                const artistItem = document.createElement('li');
                artistItem.className = 'artistItem';
    
                const imgPlayDiv = document.createElement('div');
                imgPlayDiv.className = 'img_play';
    
                const img = document.createElement('img');
                img.src = artist.images[0].url;
    
                const playIcon = document.createElement('i');
                playIcon.className = 'bi playListPlay bi-play-circle-fill';
                playIcon.id = `artistPlayIcon${index}`;
    
                imgPlayDiv.appendChild(img);
                imgPlayDiv.appendChild(playIcon);
    
                const h5 = document.createElement('h5');
                h5.innerHTML = artist.name;
                artistItem.appendChild(imgPlayDiv);
                artistItem.appendChild(h5);
    
                try {
                    const topAlbum = await fetchTopTracksOfArtist(artist.id);
                    console.log(topAlbum[0].id);
    
                    imgPlayDiv.onclick = () => {
                        playAudio(
                            topAlbum[0].preview_url,
                            topAlbum[0].name,
                            topAlbum[0].artists[0].name,
                            topAlbum[0].album.images[0].url,
                            topAlbum[0].id
                        );
                    };
                } catch (error) {
                    console.error('Error fetching top album:', error);
                }
    
                popArtistList.appendChild(artistItem);
            }
        } catch (error) {
            console.error('Error displaying popular artists:', error);
        }
    }







    async function fetchAlbumTracks(albumId) {
        const apiUrl = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const tracksData = await response.json();
        return tracksData.items;
    }

    async function displayAlbumTracks(tracks) {
        console.log("Single Songs", tracks);
        const popAlbumList = document.getElementById('playlistSongs');

        const backButtonContainer = document.createElement('div');
        backButtonContainer.id = 'backButtonContainer';
        backButtonContainer.innerHTML = '<i id="backButton" class="bi bi-arrow-left"></i>';


        // Hide other sections
        $('.popular_song').hide();
        $('.content').hide();
        $('.popular_albums').hide();
        $('.popular_artist').hide();

        // Clear existing content
        popAlbumList.innerHTML = '';


        // Create table for track listing
        const trackTable = document.createElement('table');
        trackTable.className = 'track-table';

        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['#', '', 'Title', 'Artist', '<i class="bi bi-clock"></i>'];

        headers.forEach(headerText => {
            const headerCell = document.createElement('th');
            // headerCell.textContent = headerText;
            if (headerText.includes('<i')) {
                headerCell.innerHTML = headerText;
            } else {
                headerCell.textContent = headerText;
            }
            headerRow.appendChild(headerCell);
        });

        tableHeader.appendChild(headerRow);
        trackTable.appendChild(tableHeader);

        // Create table body
        const tableBody = document.createElement('tbody');

        tracks.forEach((track, index) => {
            const trackRow = document.createElement('tr');

            const trackNumber = document.createElement('td');
            trackNumber.textContent = index + 1;

            const playIconCell = document.createElement('td');
            const playIcon = document.createElement('i');
            playIcon.className = 'bi bi-play-fill playlist-track-play-icon';
            playIcon.addEventListener('click', () => {
                isRecomandedPlaying = false;
                currentIndex = index;
                console.log(track);
                playAudio(
                    track.preview_url,
                    track.name,
                    track.artists[0].name,
                    'musicAnimation.gif',
                    track.id
                );
            });
            playIconCell.appendChild(playIcon);

            const trackTitle = document.createElement('td');
            trackTitle.textContent = track.name;

            const trackArtist = document.createElement('td');
            trackArtist.textContent = track.artists[0].name;

            const trackDuration = document.createElement('td');
            const durationInSeconds = track.duration_ms / 1000;
            trackDuration.textContent = formatTime(durationInSeconds);

            trackRow.appendChild(trackNumber);
            trackRow.appendChild(playIconCell);
            trackRow.appendChild(trackTitle);
            trackRow.appendChild(trackArtist);
            trackRow.appendChild(trackDuration);

            tableBody.appendChild(trackRow);
        });

        trackTable.appendChild(tableBody);
        popAlbumList.appendChild(backButtonContainer);
        popAlbumList.appendChild(trackTable);

        // Add a click event listener to the back icon
        document.getElementById('backButton').addEventListener('click', () => {
            // Show the previously hidden sections
            $('.popular_artist').show();
            $('.popular_song').show();
            $('.popular_albums').show();
            $('.content').show();

            // Clear the album tracks container
            popAlbumList.innerHTML = '';
        });
    }






    async function fetchUserPlaylists() {
        const apiUrl = 'https://api.spotify.com/v1/me/playlists';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const playlistsData = await response.json();
        return playlistsData.items;
    }

    async function displayUserPlaylists() {
        const userPlaylists = await fetchUserPlaylists();
        console.log(userPlaylists);
        const menuSong = document.querySelector('.menu_song');

        // Clear existing content before appending new items
        menuSong.innerHTML = '';
        // Create the "Create New Playlist" button
        const createPlaylistButton = document.createElement('button');
        createPlaylistButton.textContent = 'Create New Playlist';
        createPlaylistButton.className = 'create-playlist-button';
        createPlaylistButton.addEventListener('click', () => {
            // Create the popup container
            const popupContainer = document.createElement('div');
            popupContainer.className = 'popup-container';

            // Create the popup content
            const popupContent = document.createElement('div');
            popupContent.className = 'popup-content';

            // Add the form content to the popup
            popupContent.innerHTML = `
                <h1>Create Playlist</h1>
                <form>
                    <div class="mb-3">
                        <input type="text" id="playlistname" placeholder="Enter playlist name">
                    </div>
                    <div class="mb-3">
                    <input type="text" id="playlistdescription" placeholder="Enter playlist description">
                    </div>
                    <div class="mb-3">
                        <label>Visibility</label>
                        <div>
                            <input type="radio" name="visibility" id="private" value="false">
                            <label for="private">Private</label>
                            <input type="radio" name="visibility" id="public" value="true" checked>
                            <label for="public">Public</label>
                        </div>
                        <div>
                        </div>
                    </div>
                    <button id="submit_new_playlist" class="submit_new_playlist" type="submit">Create New Playlist</button>
                </form>
            `;

            const createPlaylistForm = popupContent.querySelector('form');
            createPlaylistForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const userID = await getCurrentUserID();
                const playlistName = createPlaylistForm.querySelector('#playlistname').value;
                const playlistDescription = createPlaylistForm.querySelector('#playlistdescription').value;
                const playlistVisibility = createPlaylistForm.querySelector('input[name="visibility"]:checked').value;

                console.log(playlistName + playlistDescription + playlistVisibility);
                await createNewPlaylist(userID, playlistName, playlistDescription, playlistVisibility);
                // Close the popup after playlist creation
                document.body.removeChild(popupContainer);
            });

            // Append the popup content to the popup container
            popupContainer.appendChild(popupContent);

            // Append the popup container to the body
            document.body.appendChild(popupContainer);

            // Close the popup when clicking outside the content
            popupContainer.addEventListener('click', (event) => {
                if (event.target === popupContainer) {
                    document.body.removeChild(popupContainer);
                }
            });
        });
        menuSong.appendChild(createPlaylistButton);

        userPlaylists.forEach((playlist, index) => {
            const playlistItem = document.createElement('li');
            playlistItem.className = 'songItem';

            const playlistImage = document.createElement('img');
            if (playlist.images.length != 0)
                playlistImage.src = playlist.images[0].url;
            playlistImage.alt = playlist.name;

            const playlistInfo = document.createElement('h5');
            playlistInfo.innerHTML = `
                ${playlist.name}<br>
                <div class="subtitle">${playlist.owner.display_name}</div>
            `;

            const playIcon = document.createElement('i');
            playIcon.className = 'bi playListPlay bi-play-circle-fill';
            playIcon.id = `playlistPlayIcon${index}`;

            playlistItem.appendChild(playlistImage);
            playlistItem.appendChild(playlistInfo);
            playlistItem.appendChild(playIcon);

            playlistItem.addEventListener('click', async () => {
                try {
                    const playlistTracks = await fetchPlaylistTracks(playlist.id);
                    displayPlaylistTracks(playlistTracks, playlist.name);
                } catch (error) {
                    console.error('Error fetching and displaying playlist tracks:', error);
                }
            });

            // playIcon.addEventListener('click', async () => {
            //     // Fetch and play tracks from the selected playlist
            //     const playlistTracks = await fetchPlaylistTracks(playlist.id);
            //     if (playlistTracks.length > 0) {
            //         const firstTrack = playlistTracks[0];
            //         playAudio(
            //             firstTrack.track.preview_url,
            //             firstTrack.track.name,
            //             firstTrack.track.artists[0].name,
            //             firstTrack.track.album.images[0].url
            //         );
            //     }
            // });

            menuSong.appendChild(playlistItem);
        });
    }

    async function displayPlaylistTracks(tracks, playlistName) {
        const popSongList = document.getElementById('playlistSongs');

        const backButtonContainer = document.createElement('div');
        backButtonContainer.id = 'backButtonContainer';
        backButtonContainer.innerHTML = '<i id="backButton" class="bi bi-arrow-left"></i>';

        // Hide other sections
        $('.popular_artist').hide();
        $('.popular_song').hide();
        $('.popular_albums').hide();
        $('.content').hide();

        // Clear existing content
        popSongList.innerHTML = '';

        // Create album details section
        const albumDetailsContainer = document.createElement('div');
        albumDetailsContainer.className = 'album-details';

        const albumImage = document.createElement('img');
        albumImage.className = 'album-image';
        albumImage.src = tracks[0].track.album.images[0].url;

        const albumInfo = document.createElement('div');
        albumInfo.className = 'album-info';

        const albumName = document.createElement('div');
        albumName.className = 'album-name';
        albumName.textContent = playlistName;
        // albumName.textContent = tracks[0].track.album.name;

        const albumTotalSongs = document.createElement('div');
        albumTotalSongs.className = 'album-total-songs';
        albumTotalSongs.textContent = `Total Songs: ${tracks.length}`;


        const albumDuration = document.createElement('div');
        albumDuration.className = 'album-duration';
        albumDuration.textContent = `Total Duration: ${calculateTotalDuration(tracks)}`;

        albumInfo.appendChild(albumName);
        albumInfo.appendChild(albumTotalSongs);
        albumInfo.appendChild(albumDuration);

        albumDetailsContainer.appendChild(albumImage);
        albumDetailsContainer.appendChild(albumInfo);

        popSongList.appendChild(backButtonContainer);
        popSongList.appendChild(albumDetailsContainer);

        // Create table for track listing
        const trackTable = document.createElement('table');
        trackTable.className = 'track-table';

        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['#', '', 'Title', 'Album', '<i class="bi bi-clock"></i>'];

        headers.forEach(headerText => {
            const headerCell = document.createElement('th');
            // headerCell.textContent = headerText;
            // If the headerText contains an icon, set innerHTML
            if (headerText.includes('<i')) {
                headerCell.innerHTML = headerText;
            } else {
                headerCell.textContent = headerText;
            }
            headerRow.appendChild(headerCell);
        });

        tableHeader.appendChild(headerRow);
        trackTable.appendChild(tableHeader);

        // Create table body
        const tableBody = document.createElement('tbody');

        tracks.forEach((track, index) => {
            const trackRow = document.createElement('tr');

            const trackNumber = document.createElement('td');
            trackNumber.textContent = index + 1;

            const playIconCell = document.createElement('td');
            const playIcon = document.createElement('i');
            playIcon.className = 'bi bi-play-fill playlist-track-play-icon';
            playIcon.addEventListener('click', () => {
                isRecomandedPlaying = false;
                currentIndex = index;
                playAudio(
                    track.track.preview_url,
                    track.track.name,
                    track.track.artists[0].name,
                    track.track.album.images[0].url,
                    track.track.id
                );
            });
            playIconCell.appendChild(playIcon);

            const trackTitle = document.createElement('td');
            trackTitle.textContent = track.track.name;

            const trackAlbum = document.createElement('td');
            trackAlbum.textContent = track.track.album.name;

            const trackDuration = document.createElement('td');
            const durationInSeconds = track.track.duration_ms / 1000;
            trackDuration.textContent = formatTime(durationInSeconds);


            trackRow.appendChild(trackNumber);
            trackRow.appendChild(playIconCell);
            trackRow.appendChild(trackTitle);
            trackRow.appendChild(trackAlbum);
            trackRow.appendChild(trackDuration);

            tableBody.appendChild(trackRow);
        });

        trackTable.appendChild(tableBody);
        popSongList.appendChild(trackTable);

        // Add a click event listener to the back icon
        document.getElementById('backButton').addEventListener('click', () => {
            // Show the previously hidden sections
            $('.popular_artist').show();
            $('.popular_song').show();
            $('.popular_albums').show();
            $('.content').show();

            // Clear the album tracks container
            popSongList.innerHTML = '';
        });
    }


    // Helper function to format time in mm:ss format
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Function to calculate the total duration of tracks in seconds
    function calculateTotalDuration(tracks) {
        let totalDurationInSeconds = 0;
        tracks.forEach(track => {
            totalDurationInSeconds += track.track.duration_ms / 1000;
        });

        const totalHours = Math.floor(totalDurationInSeconds / 3600);
        const totalMinutes = Math.floor((totalDurationInSeconds % 3600) / 60);

        return `${totalHours} hr ${totalMinutes} min`;
    }



    var tracks = null;
    var currentIndex = 0;

    async function fetchPlaylistTracks(playlistId) {
        const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const tracksData = await response.json();
        tracks = tracksData.items;
        currentIndex = 0;
        return tracksData.items;
    }



    // Get references to the tabs
    var playlistTab = $(".playlist h4.active");
    var recommendedTab = $("#recommendedTab");

    // Function to handle tab clicks
    function handleTabClick(tab) {
        playlistTab.removeClass("active");
        recommendedTab.removeClass("active");
        tab.addClass("active");

        if (tab.attr("id") === "recommendedTab") {
            displayRandomSongs(); // Call function to load recommended songs
        }
        else if (tab.attr("id") === "playlistTab") {
            displayUserPlaylists(); // Call function to display user playlists
        }
    }

    // Add click event listeners to Playlist and Recommended tabs
    playlistTab.click(function () {
        handleTabClick($(this));
        // Clear "pop_album" section and hide other sections
        // $('.pop_album').empty();
        $('.content').hide();
    });

    recommendedTab.click(function () {
        handleTabClick($(this));
    });

    // Get references to the tabs
    var discoverTab = $("#discoverTab");
    var libraryTab = $("#libraryTab");
    var userTab = $("#userTab");

    // Store the initial content of the Discover tab
    var initialDiscoverContent = $("#discoverTab").html();

    // Function to handle tab clicks
    function handleRightTabClick(rtab) {
        discoverTab.removeClass("active");
        libraryTab.removeClass("active");
        rtab.addClass("active");

        // Hide the user_item section by default
        $(".user_item").hide();
        $(".user_item_artist").hide();
        $(".user_item_track").hide();

        if (rtab.attr("id") === "libraryTab" || rtab.attr("id") === "userTab") {
            $("#discoverTab span").remove();
            libraryTab.append("<span></span>");
            $(".user_item").show();
            $(".user_item_artist").show();
            $(".user_item_track").show();
            $('.popular_artist').hide();
            $('.popular_albums').hide();
            $('.popular_song').hide();
        }

        else if (rtab.attr("id") === "discoverTab") {
            $("#libraryTab span").remove();
            discoverTab.append("<span></span>");
            window.location.href = "http://localhost/project/design.html";
            // Restore the initial content of the Discover tab
            $("#discoverTabContent").html(initialDiscoverContent);
        }
        // $('.popular_artist').show();
        // $('.popular_albums').show();
        // $('.popular_song').show();

    }

    // Add click event listeners to Playlist and Recommended tabs
    discoverTab.click(function () {
        handleRightTabClick($(this));
    });

    libraryTab.click(function () {
        handleRightTabClick($(this));
    });

    userTab.click(function () {
        handleRightTabClick($(this));
    });

    // // Event listener for tab clicks
    // $('li').click(function () {
    //     const tab = $(this);
    //     handleTabClick(tab);

    //     // Toggle active class
    //     $('li').removeClass('active');
    //     tab.addClass('active');

    //     // Empty the content of popular_artist, popular_song, and popular_albums sections
    //     $('.pop_artist').empty();
    //     $('.pop_song').empty();
    //     $('.pop_album').empty();

    //     // Show/hide the appropriate content based on the clicked tab
    //     if (tab.text().trim() === 'MY LIBRARY') {
    //         // $('.popular_artist').hide();
    //         // $('.popular_song').hide();
    //         // $('.popular_albums').hide();
    //     } else {
    //         // Show popular content or perform other actions for Discover tab
    //         // For example:
    //         displayPopularArtists();
    //         displayPopularSongs();
    //         displayPopularAlbums();
    //     }
    // });


    let currentRecomandedSongs = null;
    let isRecomandedPlaying = false;
    async function loadRecommendedSongs() {
        const apiUrl = 'https://api.spotify.com/v1/recommendations?limit=100&market=IN&seed_genres=afrobeat%2Cdisco%2Cfunk%2Cpop';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        const data = await response.json();
        currentRecomandedSongs = data.tracks;
        return data.tracks;
    }

    async function displayRandomSongs() {
        const randomSongs = await loadRecommendedSongs();
        console.log(randomSongs);
        currentIndex = 0;
        const menuSong = document.querySelector('.menu_song');

        // Clear existing content before appending new items
        menuSong.innerHTML = '';

        randomSongs.forEach((song, index) => {
            const songItem = document.createElement('li');
            songItem.className = 'songItem';

            const songImage = document.createElement('img');
            songImage.src = song.album.images[0].url;
            songImage.alt = song.name;

            const songInfo = document.createElement('h5');
            songInfo.innerHTML = `
                ${song.name}<br>
                <div class="subtitle">${song.artists.map(artist => artist.name).join(', ')}</div>
            `;

            const playIcon = document.createElement('i');
            playIcon.className = 'bi playListPlay bi-play-circle-fill';
            playIcon.id = `songPlayIcon${index}`;

            songItem.appendChild(songImage);
            songItem.appendChild(songInfo);
            songItem.appendChild(playIcon);

            songItem.addEventListener('click', () => {
                // Play the selected song
                tracks = randomSongs;
                isRecomandedPlaying = true;
                currentIndex = index;
                playAudio(
                    song.preview_url,
                    song.name,
                    song.artists[0].name,
                    song.album.images[0].url,
                    song.id
                );
            });

            menuSong.appendChild(songItem);
        });
    }



    async function displayPlaylistPopup() {
        // Fetch user playlists
        const playlists = await fetchUserPlaylists();

        // Create a popup element
        const popup = document.createElement('div');
        popup.className = 'playlist-popup';
        // Create the "Create New Playlist" button
        const createPlaylistButton = document.createElement('button');
        createPlaylistButton.textContent = 'Create New Playlist';
        createPlaylistButton.className = 'create-playlist-button';
        createPlaylistButton.addEventListener('click', () => {

         // Create the popup container
         const popupContainer = document.createElement('div');
         popupContainer.className = 'popup-container';

         // Create the popup content
         const popupContent = document.createElement('div');
         popupContent.className = 'popup-content';

         // Add the form content to the popup
         popupContent.innerHTML = `
             <h1>Create Playlist</h1>
             <form>
                 <div class="mb-3">
                     <input type="text" id="playlistname" placeholder="Enter playlist name">
                 </div>
                 <div class="mb-3">
                 <input type="text" id="playlistdescription" placeholder="Enter playlist description">
                 </div>
                 <div class="mb-3">
                     <label>Visibility</label>
                     <div>
                         <input type="radio" name="visibility" id="private" value="false">
                         <label for="private">Private</label>
                         <input type="radio" name="visibility" id="public" value="true" checked>
                         <label for="public">Public</label>
                     </div>
                     <div>
                     </div>
                 </div>
                 <button id="submit_new_playlist" class="submit_new_playlist" type="submit">Create New Playlist</button>
             </form>
         `;
            popupContainer.appendChild(popupContent);

            // Append the popup container to the body
            document.body.appendChild(popupContainer);

            
         const createPlaylistForm = popupContent.querySelector('form');
         createPlaylistForm.addEventListener('submit', async (event) => {
             event.preventDefault();

             const userID = await getCurrentUserID();
             const playlistName = createPlaylistForm.querySelector('#playlistname').value;
             const playlistDescription = createPlaylistForm.querySelector('#playlistdescription').value;
             const playlistVisibility = createPlaylistForm.querySelector('input[name="visibility"]:checked').value;

             console.log(playlistName + playlistDescription + playlistVisibility);
             await createNewPlaylist(userID, playlistName, playlistDescription, playlistVisibility);
             // Close the popup after playlist creation
             //document.body.removeChild(popupContainer);
         });
         popupContainer.addEventListener('click',async(event)=>{

            document.body.removeChild(popupContainer);
         })



        //     const createNewPlaylist = document.createElement('div');
        //     createNewPlaylist.append(`<form>
        //     <label for="name">Playlist name:</label><br>
        //     <input type="text" id="name" name="name"><br>
        //     <label for="description">Description:</label><br>
        //     <input type="text" id="description" name="description">
        //     <label for="public">public</label><br>
        //     <input type="checkbox" id="public" name="public">
            
        //   </form>`);

        });
        popup.appendChild(createPlaylistButton);

        // Create playlist items and add to the popup
        playlists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';

            const playlistImage = document.createElement('img');
            if (playlist.images.length != 0)
                playlistImage.src = playlist.images[0].url;
            playlistImage.alt = playlist.name;

            const playlistName = document.createElement('div');
            playlistName.textContent = playlist.name;

            playlistItem.appendChild(playlistImage);
            playlistItem.appendChild(playlistName);
            playlistItem.addEventListener('click', () => {
                addtoPlaylist(playlist.id, currentPlayingTrackID);
                $(".playlist-popup").hide();
                alert("Song added successfully!.");
                window.location.href = "http://localhost/project/design.html";

            });
            popup.appendChild(playlistItem);
        });

        // Add the popup to the document body
        document.body.appendChild(popup);
    }



    // Define a variable to store the currently playing audio element
    let currentlyPlayingAudio = null;
    let currentPlayingTrackID = null;

    function playAudio(previewUrl, trackName, artistName, imageUrl, trackID) {

        // Stop the currently playing audio, if any
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio.currentTime = 0;
        }
        currentPlayingTrackID = trackID;
        console.log(currentlyPlayingAudio);

        // Get the .master_play element
        const masterPlay = document.querySelector('.master_play');

        // Set the inner HTML for the .master_play element
        masterPlay.innerHTML = `
            <img src="${imageUrl}" alt="${trackName}" id="poster_master_play">
            <h5 id="title">${trackName}<br>
                <div class="subtitle">${artistName}</div>
            </h5>
            <div class="icon">
                <i class="bi bi-skip-start-fill" id="back"></i>
                <i class="bi bi-play-fill" id="masterPlay"></i>
                <i class="bi bi-skip-end-fill" id="next"></i>
            </div>
            <span id="currentStart">0:00</span>
            <div class="bar">
                <input type="range" id="seek" min="0" value="0" max="100">
                <div class="bar2" id="bar2"></div>
                <div class="dot"></div>
            </div>
            <span id="currentEnd">0:00</span>
            <div class="icon">
                <i class="bi bi-plus-lg" id="addPlaylistButton"></i>
            </div>
        `;

        // Get the add playlist button
        const addPlaylistButton = masterPlay.querySelector('#addPlaylistButton');

        // Event listener for the add playlist button
        addPlaylistButton.addEventListener('click', () => {
            displayPlaylistPopup();
        });

        // Get the audio element
        const audioElement = new Audio(previewUrl);

        // Get the play button element
        const playButton = masterPlay.querySelector('#masterPlay');

        // Update the timer and play button
        const currentStart = masterPlay.querySelector('#currentStart');
        const currentEnd = masterPlay.querySelector('#currentEnd');
        const seekBar = masterPlay.querySelector('#seek');
        const progressBar = masterPlay.querySelector('#bar2');
        const dotBar = masterPlay.querySelector('.dot');

        // Update the time and playback position when clicking on the progress bar
        seekBar.addEventListener('click', (event) => {
            const progressBarWidth = seekBar.clientWidth;
            const clickPosition = event.offsetX;
            const newPosition = (clickPosition / progressBarWidth) * audioElement.duration;

            // Set the new playback position
            audioElement.currentTime = newPosition;

            // Update the progress bar position and dot
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            dotBar.style.left = `${progressPercent}%`;
        });


        // Helper function to update the play button icon
        function updatePlayButtonIcon() {
            if (audioElement.paused) {
                playButton.classList.remove('bi-pause-fill');
                playButton.classList.add('bi-play-fill');
            } else {
                playButton.classList.remove('bi-play-fill');
                playButton.classList.add('bi-pause-fill');
            }
        }

        // Play button click event
        playButton.addEventListener('click', () => {
            if (audioElement.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }
            // updatePlayButtonIcon();
        });

        // Get the next and back buttons
        const backButton = masterPlay.querySelector('#back');
        const nextButton = masterPlay.querySelector('#next');

        // Define a variable to store the index of the currently playing track
        let currentTrackIndex = 0;

        // Function to play the next track
        function playNextTrack(tracks) {

            if (isRecomandedPlaying == true)
                playAudio(tracks[currentIndex + 1].preview_url, tracks[currentIndex + 1].name, tracks[currentIndex + 1].artists[0].name, tracks[currentIndex + 1].album.images[0].url);
            else
                playAudio(tracks[currentIndex + 1].track.preview_url, tracks[currentIndex + 1].track.name, tracks[currentIndex + 1].track.artists[0].name, tracks[currentIndex + 1].track.album.images[0].url);

            currentIndex++;
        }

        // Function to play the previous track
        function playPreviousTrack(tracks) {
            if (currentIndex == 0) {
                nextButton.disabled = true;
                nextButton.css({ opacity: 0.1, pointerEvents: 'none' }).prop('disabled', true);
            }
            else {
                if (isRecomandedPlaying == true) {
                    playAudio(tracks[currentIndex - 1].preview_url, tracks[currentIndex - 1].name, tracks[currentIndex - 1].artists[0].name, tracks[currentIndex - 1].album.images[0].url);
                    currentIndex--;
                }
                else {
                    playAudio(tracks[currentIndex - 1].track.preview_url, tracks[currentIndex - 1].track.name, tracks[currentIndex - 1].track.artists[0].name, tracks[currentIndex - 1].track.album.images[0].url);
                    currentIndex--;
                }

            }
        }
        // Call the functions with the `tracks` array as an argument
        nextButton.addEventListener('click', () => {
            playNextTrack(tracks);
        });

        backButton.addEventListener('click', () => {
            playPreviousTrack(tracks);
        });


        // Update the timer while playing
        audioElement.addEventListener('timeupdate', () => {
            currentStart.textContent = formatTime(audioElement.currentTime);

            // Update the progress bar position
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;

            // Update the dot bar position
            const dotPercent = (audioElement.currentTime / audioElement.duration) * 100;
            dotBar.style.left = `${dotPercent}%`;
        });

        // Update the play button icon when the audio is played or paused
        audioElement.addEventListener('play', updatePlayButtonIcon);
        audioElement.addEventListener('pause', updatePlayButtonIcon);


        // Update the play button icon initially
        updatePlayButtonIcon();

        // Set the loadedmetadata event to update currentEnd when metadata is loaded
        audioElement.addEventListener('loadedmetadata', () => {
            currentEnd.textContent = formatTime(audioElement.duration);
        });

        // Play the audio
        audioElement.play();

        // Update the currently playing audio variable
        currentlyPlayingAudio = audioElement;

    }

    // Helper function to format time in mm:ss format
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    //event listeners on left and right nevigation arrows
    document.getElementById('left_scroll').addEventListener('click', function() {
        // Implement left scrolling functionality
        console.log('cliscked')
        //document.getElementById('scrollable-content').scrollLeft -= 100;
    });
    
    document.getElementById('right_scroll_pop_song').addEventListener('click', function() {
        // Implement right scrolling functionality
       
       console.log('clicked'); 
       var popArtistList = document.getElementById('popSongList');
       popArtistList.scrollRight += 200; // Adjust the scroll amount as needed
    });
    


    // Event listener for the search button
    $('#searchButton').click(async function () {
        const searchQuery = $('#searchInput').val();
        if (searchQuery) {
            // Construct the Spotify API search URL
            const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=album,artist,track`;
            await displaySearchResultData(apiUrl, `Search results for "${searchQuery}"`);
        }
    });

    // function to display the search result data
    async function displaySearchResultData(apiUrl, searchQuery) {
        const data = await fetchApiData(apiUrl);
        $('.pop_song').empty();
        $('.popular_artist').hide();
        $('.pop_album').empty();
        $('#popsongtitle').text(`Top Songs - Search Results for "${searchQuery}"`);
        $('#popalbumtitle').text(`Top Albums - Search Results for "${searchQuery}"`);

        // display search results of popular songs
        if (data.tracks && data.tracks.items) {
            const tracks = data.tracks.items;
            tracks.forEach((track, index) => {
                $('.pop_song').append(`
                    <li class="songItem">
                        <div class="img_play">
                            <img src="${track.album.images[0].url}" alt="${track.name}">
                            <i class="bi playListPlay bi-play-circle-fill" id="searchPlayIcon${index}"></i>
                        </div>
                        <h5>${track.name}<br>
                            <div class="subtitle">${track.artists[0].name}</div>
                        </h5>
                    </li>
                `);

                const playIcon = document.getElementById(`searchPlayIcon${index}`);
                playIcon.addEventListener('click', () => {
                    currentPlayingTrackID = track.id;
                    playAudio(
                        track.preview_url,
                        track.name,
                        track.artists[0].name,
                        track.album.images[0].url,
                        track.id
                    );
                });
            });
        }

        // display search results of popular albums
        if (data.albums && data.albums.items) {
            const albums = data.albums.items;
            albums.forEach((album, index) => {
                $('.pop_album').append(`
                    <li class="albumItem">
                        <div class="img_play">
                            <img src="${album.images[0].url}" alt="${album.name}">
                            <!-- Adjust the ID based on your structure -->
                            <i class="bi playListPlay bi-play-circle-fill" id="searchPlayIcon${index}"></i>
                        </div>
                        <h5>${album.name}<br>
                            <div class="subtitle">${album.artists[0].name}</div>
                        </h5>
                    </li>
                `);

                const playIcon = $('.pop_album .img_play');
                currentPlayingTrackID = album.id;

                $('.pop_album').on('click', '.playListPlay', async function () {
                    const index = $(this).attr('id').replace('searchPlayIcon', '');
                    const album = albums[index]; // Assuming albums is accessible here
                    currentPlayingTrackID = album.id;
                    const albumTracks = await fetchAlbumTracks(album.id);
                    displayAlbumTracks(albumTracks);
                    // Other actions you want to perform
                });
            });
        }
    }

    // handling the authorization callback when the page loads
    handleAuthorizationCallback();
});