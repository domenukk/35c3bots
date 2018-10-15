
package io.paperbots;

import static org.junit.Assert.assertEquals;

import org.junit.BeforeClass;
import org.junit.Test;

import io.paperbots.Emails.TestEmails;
import io.paperbots.Paperbots.TokenAndName;
import io.paperbots.PaperbotsException.PaperbotsError;
import io.paperbots.data.User;
import io.paperbots.data.UserType;

public class PaperbotsTest {
	private static Paperbots paperbots;
	private static TestEmails emails = new TestEmails();

	@BeforeClass
	public static void setup () {
		paperbots = new Paperbots(Database.setupDatabase(true), emails);
	}

	@Test
	public void testSignup () {
		// Sign up
		paperbots.signup("badlogic", "badlogicgames@gmail.com", UserType.admin);

		// Retrieve code send via email
		String firstCode = emails.getMessage().split("\n")[5].trim();

		// Try to sign up with the same user name or email, should fail
		try {
			paperbots.signup("badlogic", "badlogicgames@gmail.com", UserType.admin);
		} catch (PaperbotsException e) {
			assertEquals(e.getError(), PaperbotsError.UserExists);
		}

		// Verify the code we got via email and retrieve a token
		TokenAndName tokenAndName = paperbots.verifyCode(firstCode);
		assertEquals("badlogic", tokenAndName.name);
		assertEquals(32, tokenAndName.token.trim().length());

		// Get the user for the token
		User user = paperbots.getUserForToken(tokenAndName.token);
		assertEquals(user.getName(), "badlogic");
		assertEquals(user.getType(), user.getType());
	}
}
