namespace MyProject.Domain.Entities;

public class Ticket
{
    public int Id { get; set; }

    public string Title { get; set; } = default!;

    public string Description { get; set; } = default!;

    /// <summary>
    /// 1 = Niski, 2 = Normalny, 3 = Wysoki
    /// </summary>
    public int Priority { get; set; }

    /// <summary>
    /// Nowe / W realizacji / Rozwiązane / Odrzucone
    /// </summary>
    public string Status { get; set; } = "Nowe";

    public int CategoryId { get; set; }
    public TicketCategory? Category { get; set; }


    public string CreatedByUserId { get; set; } = default!;
 
    public string? AssignedToUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public string? AdminComment { get; set; }

    public ICollection<TicketStatusHistory> StatusHistory { get; set; } = new List<TicketStatusHistory>();
}
