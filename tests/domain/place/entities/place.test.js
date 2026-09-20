const Place = require("../../../../src/domain/place/entities/place");

describe("Place entity", () => {
  test("คำนวณ rating เฉลี่ยและ reviewCount จาก reviews", () => {
    const place = new Place({
      id: 1,
      reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
    });

    expect(place.reviewCount).toBe(3);
    expect(place.rating).toBe(4.3);
  });

  test("ไม่มี review เลย rating เป็น null และ reviewCount เป็น 0", () => {
    const place = new Place({ id: 1 });

    expect(place.rating).toBeNull();
    expect(place.reviewCount).toBe(0);
  });

  test("ส่ง category, images, transports ต่อออกไปให้ frontend และไม่หลุด reviews ทั้งก้อน", () => {
    const place = new Place({
      id: 1,
      category: { id: 2, name: "Dining" },
      images: [{ id: 1, imageUrl: "https://example.com/a.jpg" }],
      transports: [{ id: 1, method: "Bus", detail: "Line 3" }],
      reviews: [{ rating: 5 }],
    });

    expect(place.category.name).toBe("Dining");
    expect(place.images).toHaveLength(1);
    expect(place.transports).toHaveLength(1);
    expect(place.reviews).toBeUndefined();
  });

  test("ไม่ส่ง relation มาเลยต้อง default เป็น null / array ว่าง", () => {
    const place = new Place({ id: 1 });

    expect(place.category).toBeNull();
    expect(place.images).toEqual([]);
    expect(place.transports).toEqual([]);
  });
});
