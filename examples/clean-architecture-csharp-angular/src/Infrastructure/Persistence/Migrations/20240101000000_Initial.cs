namespace CarRentalExample.Infrastructure.Persistence.Migrations;

public static class Initial
{
    public static void Up()
    {
        migrationBuilder.CreateTable(
            name: "Bookings",
            columns: table => { });
        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => { });
    }
}

internal static class migrationBuilder
{
    public static void CreateTable(string name, object columns) { }
}
