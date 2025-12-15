using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Infrastructure.Data;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class TicketSummaryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int TotalTickets { get; set; }
        public int NewTickets { get; set; }
        public int InProgressTickets { get; set; }
        public int ResolvedTickets { get; set; }
        public int RejectedTickets { get; set; }
    }

    
    [HttpGet("tickets-summary")]
    public async Task<ActionResult<IEnumerable<TicketSummaryDto>>> GetTicketsSummary()
    {
        var result = new List<TicketSummaryDto>();

        var connection = _context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using (var command = connection.CreateCommand())
        {
            command.CommandText = "GetTicketSummary";
            command.CommandType = CommandType.StoredProcedure;

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var item = new TicketSummaryDto
                {
                    CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                    CategoryName = reader.GetString(reader.GetOrdinal("CategoryName")),
                    TotalTickets = reader.GetInt32(reader.GetOrdinal("TotalTickets")),
                    NewTickets = reader.GetInt32(reader.GetOrdinal("NewTickets")),
                    InProgressTickets = reader.GetInt32(reader.GetOrdinal("InProgressTickets")),
                    ResolvedTickets = reader.GetInt32(reader.GetOrdinal("ResolvedTickets")),
                    RejectedTickets = reader.GetInt32(reader.GetOrdinal("RejectedTickets")),
                };

                result.Add(item);
            }
        }

        return Ok(result);
    }
}
