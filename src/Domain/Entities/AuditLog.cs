namespace MyProject.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }

    public string UserName { get; set; } = default!;

    public string Action { get; set; } = default!; // CREATE / UPDATE / DELETE / STATUS_CHANGE

    public string EntityName { get; set; } = default!; // "Ticket", "TicketCategory" itd.

    public int EntityId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
