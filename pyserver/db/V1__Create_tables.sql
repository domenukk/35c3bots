CREATE TABLE `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(25) NOT NULL DEFAULT '',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(318) NOT NULL DEFAULT ' ',
  `type` varchar(25) NOT NULL DEFAULT 'user'
);

CREATE TABLE `userCodes` (
  `userId` int(11),
  `code` varchar(6) NOT NULL DEFAULT '',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`code`),
  FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE `userTokens` (
  `userId` int(11),
  `token` varchar(32) NOT NULL DEFAULT '',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`token`),
  FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE `projects` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `userId` tinyint(11),
  `userName` varchar(25) NOT NULL DEFAULT ' ',
  `code` varchar(6) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `content` text NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastModified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `public` tinyint(1) NOT NULL DEFAULT '1',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `type` varchar(25) NOT NULL DEFAULT 'robot',
  FOREIGN KEY(userId) REFERENCES users(id)
);
