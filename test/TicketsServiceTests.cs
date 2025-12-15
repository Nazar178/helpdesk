using NUnit.Framework;

namespace test;

public class TicketsServiceTests
{
    [Test] 
    public void AddingTwoNumbers_ShouldReturnCorrectSum()
    {
        int a = 2;
        int b = 3;

     
        int result = a + b;

     
        Assert.That(result, Is.EqualTo(5));

    }
}
