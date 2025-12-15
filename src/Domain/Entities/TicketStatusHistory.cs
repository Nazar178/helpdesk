namespace MyProject.Domain.Entities;

public class TicketStatusHistory
{
    public int Id { get; set; }

    public int TicketId { get; set; }
    public Ticket? Ticket { get; set; }

    public string? OldStatus { get; set; }

    public string NewStatus { get; set; } = default!;

    public string ChangedByUserId { get; set; } = default!;

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public string? Comment { get; set; }
}
