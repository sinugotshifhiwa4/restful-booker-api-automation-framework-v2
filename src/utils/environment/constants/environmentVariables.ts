export default class ENV {
  /*
   * @ Application Model Environment Variables
   * @ Description: This class contains all the environment variables required for the application model
   * @ Configuration variables: These are loaded from environment variables with default values defined
   * It can have framework specific environment variables such as api, database, etc.
   */

  // Configuration variables
  public static APP_VERSION = process.env.APP_VERSION!;
  public static TEST_PLATFORM = process.env.TEST_PLATFORM!;
  public static TEST_TYPE = process.env.TEST_TYPE!;

  // API environment variables
  public static API_BASE_URL = process.env.API_BASE_URL!;

  public static TOKEN_USERNAME = process.env.TOKEN_USERNAME!;
  public static TOKEN_PASSWORD = process.env.TOKEN_PASSWORD!;
}
