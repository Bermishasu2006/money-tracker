package com.bermisha.money_tracker.controller;

import com.bermisha.money_tracker.model.Friend;
import com.bermisha.money_tracker.repository.FriendRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin("*")
public class FriendController {

    private final FriendRepository friendRepository;

    public FriendController(FriendRepository friendRepository) {
        this.friendRepository = friendRepository;
    }

    @GetMapping
    public List<Friend> getAllFriends() {
        return friendRepository.findAll();
    }

    @PostMapping
    public Friend addFriend(@RequestBody Friend friend) {
        return friendRepository.save(friend);
    }
}