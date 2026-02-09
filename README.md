# ⚽ FIFA World Cup 2026 API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](/)

> 🏆 **Complete REST API for FIFA World Cup 2026** - United States, Mexico & Canada

A comprehensive REST API providing real-time data for the **2026 FIFA World Cup**, the first World Cup featuring **48 teams** across **12 groups**. Get access to teams, groups, matches, stadiums, and **live scores** during the tournament.

---

## 🌟 Key Features

- 🔴 **Live Match Updates** - Real-time scores updated during matches
- 🏟️ **16 Host Stadiums** - Complete venue information across 3 countries
- 👥 **48 National Teams** - All qualified teams with details
- 📊 **12 Groups (A-L)** - Full group stage standings
- 📅 **104 Matches** - From group stage to the final
- 🌍 **Multi-language Support** - English & Persian (Farsi) data

---

## 📅 Tournament Information

| Info | Details |
|------|---------|
| **Tournament** | FIFA World Cup 2026 |
| **Host Countries** | 🇺🇸 United States, 🇲🇽 Mexico, 🇨🇦 Canada |
| **Teams** | 48 (expanded from 32) |
| **Groups** | 12 (A through L) |
| **Matches** | 104 total |
| **Opening Match** | June 11, 2026 - Mexico City |
| **Final** | July 19, 2026 - New Jersey |

---

## 🛠️ Technologies

- **Runtime:** [Node.js](https://nodejs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Framework:** Express.js
- **Authentication:** JWT Token

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/api-world-cup-2026.git

# Navigate to project directory
cd api-world-cup-2026

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the server
npm start
```

### Environment Variables

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

---

## 📖 API Documentation

### 🔐 Authentication

All endpoints (except auth routes) require a valid JWT token in the Authorization header.

```http
Authorization: Bearer ${YOUR_TOKEN}
```

---

### 🔑 Auth Endpoints

#### Register New User
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "your_secure_password"
}
```

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `name` | `string` | **Required**. User's full name |
| `email` | `string` | **Required**. Valid email address (must be unique) |
| `password` | `string` | **Required**. User password (will be hashed) |

**Success Response (200):**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-06T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| `400` | User already exists |
| `400` | Registration failed |

---

#### Login / Authenticate
```http
POST /auth/authenticate
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "your_password"
}
```

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `email` | `string` | **Required**. Registered email address |
| `password` | `string` | **Required**. Account password |

**Success Response (200):**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| `400` | User not found |
| `400` | Invalid password |

---

### 🔒 Token Usage

After successful login/registration, use the returned token for all API requests:

```javascript
// Example using fetch
fetch('https://api.example.com/get/teams', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
```

```bash
# Example using cURL
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.example.com/get/teams
```

> ⏰ **Token Expiry:** Tokens are valid for **84 days** (7,257,600 seconds). After expiration, you'll need to login again.

---

### 👥 Team Endpoints

#### Get All Teams
```http
GET /get/teams
Authorization: Bearer ${Token}
```
Returns all 48 qualified teams for World Cup 2026.

**Response Example:**
```json
{
  "id": "37",
  "name_en": "Argentina",
  "name_fa": "آرژانتین",
  "fifa_code": "ARG",
  "groups": "J",
  "flag": "https://..."
}
```

#### Get Team by ID
```http
GET /get/team/${teamId}
Authorization: Bearer ${Token}
```
| Parameter | Type | Description |
|:----------|:-----|:------------|
| `teamId` | `string` | **Required**. Unique team identifier |

#### Get Team by Name
```http
GET /get/team/?name=${teamName}
Authorization: Bearer ${Token}
```
| Parameter | Type | Description |
|:----------|:-----|:------------|
| `teamName` | `string` | Team name (English or Persian) |

#### Get Teams by Group
```http
GET /get/teams/?group=${groupName}
Authorization: Bearer ${Token}
```
| Parameter | Type | Description |
|:----------|:-----|:------------|
| `groupName` | `string` | Group letter (A-L) |

---

### 📊 Group Endpoints

#### Get All Groups
```http
GET /get/groups
Authorization: Bearer ${Token}
```
Returns all 12 groups with standings table.

**Response Example:**
```json
{
  "group": "G",
  "teams": [
    { "team_id": "25", "pts": "0", "gf": "0", "ga": "0" },
    { "team_id": "26", "pts": "0", "gf": "0", "ga": "0" },
    { "team_id": "27", "pts": "0", "gf": "0", "ga": "0" },
    { "team_id": "28", "pts": "0", "gf": "0", "ga": "0" }
  ]
}
```

#### Get Group by ID
```http
GET /get/group/${groupId}
Authorization: Bearer ${Token}
```
| Parameter | Type | Description |
|:----------|:-----|:------------|
| `groupId` | `string` | **Required**. Group identifier |

#### Get Group by Name
```http
GET /get/group/?name=${groupName}
Authorization: Bearer ${Token}
```
| Parameter | Type | Description |
|:----------|:-----|:------------|
| `groupName` | `string` | Group letter (A, B, C... L) |

---

### ⚽ Match Endpoints

#### Get All Matches
```http
GET /get/games
Authorization: Bearer ${Token}
```
Returns all 104 matches of the tournament.

#### Get Match by ID
```http
GET /get/game/${matchId}
Authorization: Bearer ${Token}
```
| Parameter | Type | Description |
|:----------|:-----|:------------|
| `matchId` | `string` | **Required**. Match identifier |

**Response Example:**
```json
{
  "id": "1",
  "home_team_id": "1",
  "away_team_id": "2",
  "home_score": 0,
  "away_score": 0,
  "group": "A",
  "matchday": "1",
  "local_date": "June 11, 2026",
  "stadium_id": "1",
  "finished": false,
  "type": "group"
}
```

---

### 🏟️ Stadium Endpoints

#### Get All Stadiums
```http
GET /get/stadiums
Authorization: Bearer ${Token}
```
Returns all 16 host stadiums.

**Response Example:**
```json
{
  "id": "11",
  "name_en": "MetLife Stadium",
  "name_fa": "استادیوم متلایف",
  "fifa_name": "New York/New Jersey Stadium",
  "city_en": "East Rutherford, NJ",
  "country_en": "United States",
  "capacity": 82500
}
```

---

## 🔴 Live Score Updates

> **⚡ During the FIFA World Cup 2026 tournament (June 11 - July 19, 2026), match scores and statistics will be updated in real-time!**

### Live Data Includes:
- ✅ Current match scores
- ✅ Goal scorers with timestamps
- ✅ Match status (upcoming, live, finished)
- ✅ Time elapsed
- ✅ Group standings automatically updated

---

## 🏆 World Cup 2026 Groups

| Group A | Group B | Group C | Group D |
|---------|---------|---------|---------|
| 🇲🇽 Mexico | 🇨🇦 Canada | 🇧🇷 Brazil | 🇺🇸 USA |
| 🇿🇦 South Africa | 🇨🇭 Switzerland | 🇲🇦 Morocco | 🇵🇾 Paraguay |
| 🇰🇷 South Korea | 🇶🇦 Qatar | 🇭🇹 Haiti | 🇦🇺 Australia |
| TBD | TBD | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland | TBD |

| Group E | Group F | Group G | Group H |
|---------|---------|---------|---------|
| 🇩🇪 Germany | 🇳🇱 Netherlands | 🇧🇪 Belgium | 🇪🇸 Spain |
| 🇨🇼 Curaçao | 🇯🇵 Japan | 🇪🇬 Egypt | 🇨🇻 Cape Verde |
| 🇨🇮 Ivory Coast | 🇹🇳 Tunisia | 🇮🇷 Iran | 🇸🇦 Saudi Arabia |
| 🇪🇨 Ecuador | TBD | 🇳🇿 New Zealand | 🇺🇾 Uruguay |

| Group I | Group J | Group K | Group L |
|---------|---------|---------|---------|
| 🇫🇷 France | 🇦🇷 Argentina | 🇵🇹 Portugal | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England |
| 🇸🇳 Senegal | 🇩🇿 Algeria | 🇨🇴 Colombia | 🇭🇷 Croatia |
| 🇳🇴 Norway | 🇦🇹 Austria | 🇺🇿 Uzbekistan | 🇬🇭 Ghana |
| TBD | 🇯🇴 Jordan | TBD | 🇵🇦 Panama |

---

## 🏟️ Host Stadiums

### 🇺🇸 United States (11 Venues)
| Stadium | City | Capacity |
|---------|------|----------|
| MetLife Stadium | New York/New Jersey | 82,500 |
| AT&T Stadium | Dallas | 94,000 |
| SoFi Stadium | Los Angeles | 70,000 |
| Hard Rock Stadium | Miami | 65,000 |
| Mercedes-Benz Stadium | Atlanta | 75,000 |
| NRG Stadium | Houston | 72,000 |
| Lincoln Financial Field | Philadelphia | 69,000 |
| Levi's Stadium | San Francisco | 71,000 |
| Lumen Field | Seattle | 69,000 |
| Gillette Stadium | Boston | 65,000 |
| Arrowhead Stadium | Kansas City | 73,000 |

### 🇲🇽 Mexico (3 Venues)
| Stadium | City | Capacity |
|---------|------|----------|
| Estadio Azteca | Mexico City | 83,000 |
| Estadio Akron | Guadalajara | 48,000 |
| Estadio BBVA | Monterrey | 53,500 |

### 🇨🇦 Canada (2 Venues)
| Stadium | City | Capacity |
|---------|------|----------|
| BC Place | Vancouver | 54,000 |
| BMO Field | Toronto | 45,000 |

---

## 📊 Response Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request |
| `401` | Unauthorized - Invalid or missing token |
| `404` | Resource not found |
| `500` | Internal Server Error |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Related Links

- [FIFA Official Website](https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026)
- [World Cup 2026 Official](https://www.fifa.com/worldcup/)

---

## 📧 Contact & Support

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Keywords:** FIFA World Cup 2026 API, World Cup API, Soccer API, Football API, FIFA API, World Cup 2026 Data, Live Soccer Scores, World Cup Live Scores, REST API Football, Node.js Football API, 2026 World Cup Teams, World Cup Groups, World Cup Matches, World Cup Stadiums, USA Mexico Canada World Cup